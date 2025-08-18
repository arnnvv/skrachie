import { webcrypto } from "node:crypto";
import {
  decodeBase64urlIgnorePadding,
  encodeBase64,
  encodeBase64urlNoPadding,
  encodeHexLowerCase,
} from "./encoding";

const generateRandomBytes = (length: number): Uint8Array => {
  return webcrypto.getRandomValues(new Uint8Array(length));
};

describe("Encoding Utilities", () => {
  describe("encodeHexLowerCase", () => {
    it("should correctly encode a byte array to a lowercase hex string", () => {
      const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      expect(encodeHexLowerCase(bytes)).toBe("deadbeef");
    });

    it("should return an empty string for an empty byte array", () => {
      const bytes = new Uint8Array([]);
      expect(encodeHexLowerCase(bytes)).toBe("");
    });

    it("should correctly handle single-digit hex values by padding with a leading zero", () => {
      const bytes = new Uint8Array([0x0a, 0x05, 0x0f]);
      expect(encodeHexLowerCase(bytes)).toBe("0a050f");
    });

    it("should correctly handle a byte array containing a zero byte", () => {
      const bytes = new Uint8Array([0xca, 0xfe, 0x00, 0xba, 0xbe]);
      expect(encodeHexLowerCase(bytes)).toBe("cafe00babe");
    });
  });

  describe("encodeBase64", () => {
    it("should correctly encode a byte array with a length divisible by 3 (no padding)", () => {
      const input = new TextEncoder().encode("Man");
      expect(encodeBase64(input)).toBe("TWFu");
    });

    it("should correctly encode with single '=' padding", () => {
      const input = new TextEncoder().encode("Ma");
      expect(encodeBase64(input)).toBe("TWE=");
    });

    it("should correctly encode with double '==' padding", () => {
      const input = new TextEncoder().encode("M");
      expect(encodeBase64(input)).toBe("TQ==");
    });

    it("should return an empty string for an empty input", () => {
      const input = new Uint8Array([]);
      expect(encodeBase64(input)).toBe("");
    });

    it("should correctly encode byte values that result in '+' and '/' characters", () => {
      const bytes = new Uint8Array([0xfb, 0xff, 0xbe]);
      expect(encodeBase64(bytes)).toBe("+/++");
    });
  });

  describe("encodeBase64urlNoPadding", () => {
    it("should replace '+' with '-' and '/' with '_' compared to standard Base64", () => {
      const bytesWithSpecialChars = new Uint8Array([0xfb, 0xff, 0xbe]);
      expect(encodeBase64(bytesWithSpecialChars)).toBe("+/++");
      expect(encodeBase64urlNoPadding(bytesWithSpecialChars)).toBe("-_--");
    });

    it("should not include padding characters", () => {
      const oneByte = new TextEncoder().encode("M");
      expect(encodeBase64urlNoPadding(oneByte)).toBe("TQ");

      const twoBytes = new TextEncoder().encode("Ma");
      expect(encodeBase64urlNoPadding(twoBytes)).toBe("TWE");

      const threeBytes = new TextEncoder().encode("Man");
      expect(encodeBase64urlNoPadding(threeBytes)).toBe("TWFu");
    });
  });

  describe("Base64URL Round-trip Validation", () => {
    it("should correctly encode and then decode random binary data of various lengths", () => {
      const lengthsToTest = [0, 1, 2, 3, 4, 31, 32, 33, 63, 64, 65, 128];

      for (const length of lengthsToTest) {
        const originalBytes = generateRandomBytes(length);
        const encoded = encodeBase64urlNoPadding(originalBytes);
        const decodedBytes = decodeBase64urlIgnorePadding(encoded);

        expect(decodedBytes).toEqual(originalBytes);
      }
    });

    it("should correctly decode a valid Base64URL string that contains padding from another source", () => {
      const originalString = "Hello, world!";
      const encodedWithPadding = "SGVsbG8sIHdvcmxkIQ==";
      const decodedBytes = decodeBase64urlIgnorePadding(encodedWithPadding);
      const decodedString = new TextDecoder().decode(decodedBytes);

      expect(decodedString).toBe(originalString);
    });

    it("should perform a round-trip for a known string with special characters", () => {
      const originalString = "A test string with various characters!?123-_+/@";
      const originalBytes = new TextEncoder().encode(originalString);

      const encoded = encodeBase64urlNoPadding(originalBytes);
      const decodedBytes = decodeBase64urlIgnorePadding(encoded);

      expect(new TextDecoder().decode(decodedBytes)).toBe(originalString);
    });
  });
});
