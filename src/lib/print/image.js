// Logo / photo uploads for printed items: shrunk in the browser so saved designs stay small.
// Nothing is uploaded anywhere.

const MAX_INPUT = 12 * 1024 * 1024;

export function shrinkImage(file, maxSide = 800) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file selected."));
    if (!/^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.type)) return reject(new Error("Choose a PNG, JPG, WebP or SVG image."));
    if (file.size > MAX_INPUT) return reject(new Error("That image is too big (max 12 MB)."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const src = reader.result;
      // SVG logos stay sharp as vectors when they're small enough.
      if (file.type === "image/svg+xml") {
        if (file.size <= 300 * 1024) return resolve(src);
        return reject(new Error("SVG must be under 300 KB."));
      }
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const keepAlpha = file.type !== "image/jpeg";
        resolve(canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.9));
      };
      img.onerror = () => reject(new Error("That file isn't a readable image."));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
