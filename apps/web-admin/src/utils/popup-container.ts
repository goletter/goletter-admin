const DESKTOP_MODES = new Set(['desktop', 'desktop-dev']);

export function getDesktopConfirmProps() {
  return DESKTOP_MODES.has(import.meta.env.MODE)
    ? {
        getContainer: () => document.body,
        wrapClassName: 'desktop-confirm-modal-wrap',
      }
    : {
        getContainer: () => document.body,
      };
}
