// Converts our SVG string into pixels (a <canvas>). Used for PNG/JPG/PDF export,
// copy-to-clipboard and the scan check. Browser only.

// Sets the pixel size on the root <svg> tag.
export function withSize(svg, width, height) {
  return svg.replace(/^<svg([^>]*?) width="\d+" height="\d+"/, `<svg$1 width="${width}" height="${height}"`);
}

export function svgToCanvas(svg, width, height, { background = null } = {}) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([withSize(svg, width, height)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (background) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't draw the QR image. Try removing the logo or picture and try again."));
    };
    img.src = url;
  });
}

export function canvasToBlob(canvas, type = "image/png", quality = 0.95) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't create the image file."))), type, quality);
  });
}
