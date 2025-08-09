export function encodeBase64urlNoPadding(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

export function encodeBase32LowerCaseNoPadding(bytes: Uint8Array): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  if (bytes.length === 0) {
    return "";
  }

  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

export function encodeHexLowerCase(data: Uint8Array): string {
  return Buffer.from(data).toString("hex");
}

export function encodeBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function decodeBase64urlIgnorePadding(encoded: string): Uint8Array {
  return Buffer.from(encoded, "base64url");
}
