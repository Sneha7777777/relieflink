import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const urgencyColor: Record<string, string> = {
  LOW: "bg-urgent-low/10 text-urgent-low border-urgent-low/30",
  MEDIUM: "bg-urgent-medium/10 text-urgent-medium border-urgent-medium/30",
  HIGH: "bg-urgent-high/10 text-urgent-high border-urgent-high/30",
  CRITICAL: "bg-urgent-critical/10 text-urgent-critical border-urgent-critical/30",
};
