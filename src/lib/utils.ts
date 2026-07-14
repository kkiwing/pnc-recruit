import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 로컬 타임존 기준 YYYY-MM-DD 문자열로 변환 (toISOString은 UTC로 자정 근처 날짜가 밀릴 수 있어 사용하지 않음). */
export function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
