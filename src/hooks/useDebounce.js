"use client";

import { useEffect, useState } from "react";

// Waits until the user stops typing for `delay` ms before returning the new value.
// This stops the QR from re-drawing on every single key press.
export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
