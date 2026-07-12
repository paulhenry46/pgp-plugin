export const card = {
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: '8px',
  padding: '12px',
  background: 'var(--color-background, #fff)',
  color: 'var(--color-foreground, #0f172a)',
};
export const btn = {
  font: 'inherit',
  padding: '6px 12px',
  borderRadius: '6px',
  border: '0px solid var(--color-input, #cbd5e1)',
  color: 'var(--color-foreground, #0f172a)',
  cursor: 'pointer',
};

export function fmtDate(iso: string | number | Date | null) {
  try { return iso ? new Date(iso).toLocaleDateString() : 'Never'; } catch { return iso; }
}
export function isExpired(iso: string | number | Date | null) {
  if(!iso) return false;
  try { return iso ? new Date(iso).getTime() < Date.now() : false; } catch { return false; }
}