import L from "leaflet";
import { openDB } from "idb";

const DB_NAME = "osm_offline_tiles";
const STORE_NAME = "tiles";

export const getTileDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export class OfflineTileLayer extends L.TileLayer {
  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement("img");
    L.DomEvent.on(tile, "load", L.bind(this._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, "error", L.bind(this._tileOnError, this, done, tile));
    if (this.options.crossOrigin || this.options.crossOrigin === "") {
      tile.crossOrigin = this.options.crossOrigin === true ? "" : this.options.crossOrigin;
    }
    tile.alt = "";
    tile.setAttribute("role", "presentation");
    const url = this.getTileUrl(coords);
    
    getTileDB().then(async (db) => {
      try {
        const cachedTile = await db.get(STORE_NAME, url);
        if (cachedTile) {
          tile.src = URL.createObjectURL(cachedTile);
          return;
        }
      } catch (err) { }

      if (navigator.onLine) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const blob = await response.blob();
            await db.put(STORE_NAME, blob, url);
            tile.src = URL.createObjectURL(blob);
          } else {
            tile.src = url;
          }
        } catch (err) {
          tile.src = url;
        }
      } else {
        done(new Error("Offline and tile not cached"), tile);
      }
    });

    return tile;
  }
}

export function offlineTileLayer(url: string, options?: L.TileLayerOptions) {
  return new OfflineTileLayer(url, options);
}

function lon2tile(lon: number, zoom: number) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat: number, zoom: number) { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

export async function downloadTilesForLocation(lat: number, lon: number) {
  const db = await getTileDB();
  const zooms = [13, 14, 15]; // Zoom levels to cache
  const urlTemplate = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const subdomains = ["a", "b", "c"];
  
  let totalDownloaded = 0;

  for (const z of zooms) {
    const cx = lon2tile(lon, z);
    const cy = lat2tile(lat, z);
    
    // Determine grid size based on zoom level to cover roughly 3-5km radius
    let r = 1;
    if (z === 14) r = 2;
    if (z === 15) r = 4;

    for (let x = cx - r; x <= cx + r; x++) {
      for (let y = cy - r; y <= cy + r; y++) {
        const s = subdomains[(x + y) % subdomains.length];
        const url = urlTemplate.replace("{s}", s).replace("{z}", z.toString()).replace("{x}", x.toString()).replace("{y}", y.toString());
        
        const cachedTile = await db.get(STORE_NAME, url);
        if (!cachedTile) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const blob = await res.blob();
              await db.put(STORE_NAME, blob, url);
              totalDownloaded++;
            }
          } catch (e) {
            console.warn("Gagal unduh tile", url);
          }
        }
      }
    }
  }
  return totalDownloaded;
}
