import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAvatarUrl = (photo: string | null | undefined) => {
  if (!photo) return undefined;
  if (photo.startsWith("http")) return photo;
  return `http://localhost:3000/uploads/${photo}`;
};
