const ITERATIONS = 100_000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

export async function hashPassword(
  password: string
): Promise<string> {
  const encoder = new TextEncoder();

  const salt = crypto.getRandomValues(
    new Uint8Array(SALT_LENGTH)
  );

  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

  const hashBuffer =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      KEY_LENGTH
    );

  const saltBase64 =
    bufferToBase64(salt.buffer);

  const hashBase64 =
    bufferToBase64(hashBuffer);

  return `${saltBase64}:${hashBase64}`;
}

export async function verifyPassword(
  password: string,
  storedPassword: string
): Promise<boolean> {
  try {
    const [saltBase64, storedHashBase64] =
      storedPassword.split(":");

    if (!saltBase64 || !storedHashBase64) {
      return false;
    }

    const encoder = new TextEncoder();

    const salt =
      new Uint8Array(
        base64ToBuffer(saltBase64)
      );

    const keyMaterial =
      await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );

    const hashBuffer =
      await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt,
          iterations: ITERATIONS,
          hash: "SHA-256",
        },
        keyMaterial,
        KEY_LENGTH
      );

    const hashBase64 =
      bufferToBase64(hashBuffer);

    return hashBase64 === storedHashBase64;
  } catch (error) {
    console.error(
      "Password verification error:",
      error
    );

    return false;
  }
}