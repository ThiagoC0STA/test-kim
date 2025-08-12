import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function firstMissingAlphabetLetter(fullName: string): string {
  const letters = fullName.toLowerCase().replace(/[^a-z]/g, "");
  const uniqueLetters = new Set(letters);

  for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    if (!uniqueLetters.has(letter)) {
      return letter;
    }
  }
  return "-";
}
