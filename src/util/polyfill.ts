// DOMException global polyfill

globalThis.DOMException ||
  (() => {
    try {
      atob(0 as any);
    } catch (err) {
      return err.constructor;
    }
  })();
