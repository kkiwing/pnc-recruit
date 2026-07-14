function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3 ? normalized.split('').map(c => c + c).join('') : normalized;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function channelLuminance(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** 배경색(hex)에 대해 WCAG 상대 명도 기준으로 흰색/검정 중 대비가 더 높은 텍스트 색을 반환한다. */
export function getContrastTextColor(backgroundHex: string): string {
  const bgLuminance = relativeLuminance(hexToRgb(backgroundHex));
  const contrastWithWhite = contrastRatio(bgLuminance, 1);
  const contrastWithBlack = contrastRatio(bgLuminance, 0);
  return contrastWithWhite >= contrastWithBlack ? '#ffffff' : '#000000';
}
