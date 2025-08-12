import { firstMissingAlphabetLetter } from "../utils";

describe("firstMissingAlphabetLetter", () => {
  it('should return first missing letter for "Ana Beatriz"', () => {
    const result = firstMissingAlphabetLetter("Ana Beatriz");
    expect(result).toBe("c");
  });

  it('should return first missing letter for "Carlos Eduardo"', () => {
    const result = firstMissingAlphabetLetter("Carlos Eduardo");
    expect(result).toBe("b");
  });

  it('should return "-" when all letters are present', () => {
    const result = firstMissingAlphabetLetter("abcdefghijklmnopqrstuvwxyz");
    expect(result).toBe("-");
  });

  it("should handle empty string", () => {
    const result = firstMissingAlphabetLetter("");
    expect(result).toBe("a");
  });

  it("should handle string with only numbers and symbols", () => {
    const result = firstMissingAlphabetLetter("123!@#");
    expect(result).toBe("a");
  });

  it("should be case insensitive", () => {
    const result1 = firstMissingAlphabetLetter("ABC");
    const result2 = firstMissingAlphabetLetter("abc");
    expect(result1).toBe("d");
    expect(result2).toBe("d");
  });
});
