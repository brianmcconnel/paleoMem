const HEADER_HEIGHT_PX = 48; // matches header h-12 / sticky reader top-12
const SECTION_GAP_PX = 8;

/** Offset so a section lands below the sticky header and reader panel. */
export function getScrollOffsetForSection(id: string): number {
  let offset = HEADER_HEIGHT_PX;

  if (id !== 'reader') {
    const reader = document.getElementById('reader');
    if (reader) offset += reader.offsetHeight;
    offset += SECTION_GAP_PX;
  }

  return offset;
}

export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - getScrollOffsetForSection(id);
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  window.dispatchEvent(new CustomEvent('paleomem:collapse-picker'));
}