// Fonts for printed items.
//
// Cards are SVG, and SVG turned into an image (for PNG/PDF) can't load web fonts.
// So we only use fonts that already exist on phones and computers, with Devanagari
// fallbacks so Hindi text also prints. `k` / `kb` = average character width as a share
// of the font size (regular / bold), used to shrink text that would overflow.

const HINDI = "'Nirmala UI', 'Noto Sans Devanagari', Mangal, 'Kohinoor Devanagari'";

export const FONTS = {
  modern: { id: "modern", label: "Modern", family: `Arial, Helvetica, ${HINDI}, sans-serif`, k: 0.53, kb: 0.6 },
  elegant: { id: "elegant", label: "Elegant serif", family: `Georgia, 'Times New Roman', ${HINDI}, serif`, k: 0.56, kb: 0.62 },
  friendly: { id: "friendly", label: "Friendly", family: `'Trebuchet MS', Verdana, ${HINDI}, sans-serif`, k: 0.53, kb: 0.58 },
  bold: { id: "bold", label: "Extra bold", family: `'Arial Black', 'Arial Bold', Arial, ${HINDI}, sans-serif`, k: 0.66, kb: 0.7, weight: 900 },
};

export const FONT_OPTIONS = Object.values(FONTS).map((f) => ({ value: f.id, label: f.label }));

export const BODY_FONT = FONTS.modern;

export const getFont = (id) => FONTS[id] ?? FONTS.modern;
