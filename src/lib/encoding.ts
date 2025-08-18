export function encodeBase64urlNoPadding(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

export function encodeHexLowerCase(data: Uint8Array): string {
  return Buffer.from(data).toString("hex");
}

export function encodeBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function decodeBase64urlIgnorePadding(encoded: string): Uint8Array {
  return new Uint8Array(Buffer.from(encoded, "base64url"));
}
