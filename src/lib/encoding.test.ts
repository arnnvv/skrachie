import {
  decodeBase64urlIgnorePadding,
  encodeBase64,
  encodeBase64urlNoPadding,
  encodeHexLowerCase,
} from "./encoding";

describe("Encoding Utilities", () => {
  describe("encodeHexLowerCase", () => {
    it("should correctly encode a byte array to a lowercase hex string", () => {
      const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      const expected = "deadbeef";
      expect(encodeHexLowerCase(bytes)).toBe(expected);
    });

    it("should return an empty string for an empty byte array", () => {
      const bytes = new Uint8Array([]);
      expect(encodeHexLowerCase(bytes)).toBe("");
    });

    it("should correctly handle single-digit hex values with a leading zero", () => {
      const bytes = new Uint8Array([0x0a, 0x05, 0x0f]);
      const expected = "0a050f";
      expect(encodeHexLowerCase(bytes)).toBe(expected);
    });
  });

  describe("encodeBase64", () => {
    it("should correctly encode a string to standard Base64 with padding", () => {
      const input = new TextEncoder().encode("Man"); // 3 bytes, no padding
      expect(encodeBase64(input)).toBe("TWFu");
    });

    it("should correctly add single '=' padding", () => {
      const input = new TextEncoder().encode("Ma"); // 2 bytes
      expect(encodeBase64(input)).toBe("TWE=");
    });

    it("should correctly add double '==' padding", () => {
      const input = new TextEncoder().encode("M"); // 1 byte
      expect(encodeBase64(input)).toBe("TQ==");
    });

    it("should return an empty string for empty input", () => {
      const input = new Uint8Array([]);
      expect(encodeBase64(input)).toBe("");
    });
  });

  describe("encodeBase64urlNoPadding", () => {
    it("should correctly encode a string to Base64URL without padding", () => {
      // Standard Base64 would be "SGVsbG8sIHdvcmxkIQ=="
      const input = new TextEncoder().encode("Hello, world!");
      expect(encodeBase64urlNoPadding(input)).toBe("SGVsbG8sIHdvcmxkIQ");
    });

    it("should use URL-safe characters '-' and '_'", () => {
      const input = new Uint8Array([251, 254, 252]);
      expect(encodeBase64urlNoPadding(input)).toBe("-_78");
    });
  });

  describe("decodeBase64urlIgnorePadding", () => {
    it("should perform a round-trip encode/decode cycle successfully", () => {
      const originalString = "A test string with various characters!?123";
      const originalBytes = new TextEncoder().encode(originalString);

      const encoded = encodeBase64urlNoPadding(originalBytes);
      const roundTripBytes = decodeBase64urlIgnorePadding(encoded);

      const decodedString = new TextDecoder().decode(roundTripBytes);
      expect(decodedString).toBe(originalString);
    });

    it("should correctly decode a string with URL-safe characters", () => {
      const encoded = "-_78";
      const expectedBytes = new Uint8Array([251, 254, 252]);
      const decodedBytes = decodeBase64urlIgnorePadding(encoded);
      expect(new Uint8Array(decodedBytes)).toEqual(expectedBytes);
    });

    it("should correctly decode a string that has optional padding", () => {
      const encodedWithPadding = "SGVsbG8sIHdvcmxkIQ==";
      const decodedBytes = decodeBase64urlIgnorePadding(encodedWithPadding);
      const decodedString = new TextDecoder().decode(decodedBytes);

      expect(decodedString).toBe("Hello, world!");
    });
  });
});
