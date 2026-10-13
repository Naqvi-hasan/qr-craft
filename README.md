# QR Craft: Creative QR Studio

Ek free QR design workspace: 13 QR types (URL, Text, PDF link, Phone, SMS, WhatsApp, Email, Contact, WiFi, Location, UPI, App, Social), themes, templates, frames, logo, picture art, aur PNG / SVG / PDF / JPG export. Sab kuch browser mein chalta hai: koi backend nahi, user ka data kahin upload nahi hota.

**Tech:** Next.js 15 (App Router) + React 19 + Tailwind CSS v4
**Libraries:** `qrcode-generator` (sirf QR ki math), `jsqr` (scan check), `jspdf` (PDF export). QR ki drawing hamara apna engine karta hai (`src/lib/qr/`).

---

## Chalane ke steps

Node.js 18.18+ chahiye.

```bash
npm install      # packages install (pehli baar, aur package.json badalne ke baad)
npm run dev      # http://localhost:3000
npm test         # 34 unit tests
npm run build    # production build
```

Pages: `/` = QR Studio, `/templates` = Template gallery.
Shareable links: `/#wifi` WiFi tab kholta hai, `/?template=cafe-menu#url` template laga ke kholta hai.

**Free hosting (Vercel):** GitHub pe push karo, vercel.com pe "Import Project", Deploy.

---

## Features

**Studio (design controls)**
- Themes: Classic, Dark, Firefly, Minimal, Business, Playful (one click)
- Dot shapes: Square, Fluid, Dots, Diamond, Leaf, Pixel
- Corner (eye) shapes: frame aur centre alag alag, alag colour bhi
- Solid colour ya gradient (linear with angle, radial)
- Frame + CTA label: Label below, Label above, Badge. QR type ke hisaab se label suggest hota hai ("Join WiFi", "Pay now"...)
- Logo: size aur padding slider. Bahut bada logo apne aap safe size pe chhota ho jata hai
- **Picture art:** QR ke apne dots ko rang ke heart, star, pin, cup, leaf, letters (monogram) ya aapki upload ki hui shape banana. Colours apne aap scan-safe adjust hote hain
- Background colour, transparent background, rounded corners
- Error correction, quiet zone

**Quality**
- **Scan check:** har design ko pixels mein badal ke asli decoder (jsQR) se padha jata hai. Padh liya to "Scan-tested" badge, nahi to "Might not scan" aur sudharne ke tips
- Contrast, transparent aur dark background ki warnings

**Export:** PNG, JPG (512 se 4096 px), SVG (vector), PDF (300 DPI print-ready), copy as image, apna file name.

**Layout:** badi screen pe 3 column (Content | Preview | Design), laptop pe Content/Design tabs + preview, phone pe tabs + floating "QR ready" button. Light/dark theme.

**Templates page:** 12 templates (Business, Food & café, Events, Payments, Social & gaming, Places), category filter, asli scannable preview.

---

## Folder structure

```
src/
├── app/
│   ├── layout.js               HTML shell, font, theme script, SEO
│   ├── page.js                 /  -> QR Studio
│   ├── templates/page.js       /templates
│   └── globals.css             Colour tokens (light + dark), Tailwind
│
├── components/
│   ├── Icon.js                 Saare icons
│   ├── layout/                 Har page ka frame
│   │   ├── AppShell.js         Header + Sidebar + Footer
│   │   ├── Header.js           Logo, Help, theme toggle, phone navigation
│   │   ├── Sidebar.js          Left menu (Studio, Templates, Scanner*, Library*)
│   │   ├── nav.js              Menu items (* = "Soon")
│   │   ├── Hero.js             Page banner
│   │   └── Footer.js, Logo.js, ThemeToggle.js, HelpDialog.js
│   ├── studio/
│   │   ├── StudioApp.js        Selected QR type (URL hash) + template link
│   │   ├── QrStudio.js         Editor: state, 3-column/tabs layout
│   │   ├── TypeTabs.js         URL / Phone / WiFi... tiles
│   │   ├── QrForm.js           Selected type ka form
│   │   ├── fields/FormField.js Generic input
│   │   ├── QrPreview.js        Live preview + scan badge
│   │   ├── ExportPanel.js      Download / copy
│   │   ├── MobileQrBar.js      Phone pe floating button
│   │   └── design/             Design panel ke sections
│   │       ├── DesignPanel.js  Saare sections ek jagah
│   │       ├── controls.js     Shared: Section, ColorInput, Slider, Toggle...
│   │       └── ThemePicker, DotControls, EyeControls, FrameControls,
│   │           LogoControls, ArtControls, BackgroundControls, AdvancedControls
│   └── templates/
│       ├── TemplateGallery.js  Category filter + grid
│       └── TemplateCard.js     Ek template ka preview + "Use this template"
│
├── qr-types/                   Har QR type ki ALAG file (fields, validation, format)
│
├── lib/
│   ├── qr/                     QR engine
│   │   ├── matrix.js           Text -> dots ki grid (qrcode-generator)
│   │   ├── shapes.js           Dot aur eye shapes (SVG paths)
│   │   ├── render.js           Grid + style -> SVG (frame, logo, art, gradient)
│   │   ├── mask.js             Picture art ki shape -> kaunse dots rangne hain
│   │   ├── style.js            Style helpers: merge, theme, template, warnings
│   │   ├── raster.js           SVG -> canvas
│   │   ├── export.js           PNG / JPG / SVG / PDF download, copy
│   │   └── validate.js         Scan check (jsQR)
│   ├── color.js                Contrast, colour mixing, art colours
│   ├── validators.js, escape.js, capacity.js
│
├── hooks/
│   ├── useQrDesign.js          payload + style -> SVG
│   ├── useScanCheck.js         SVG -> "pass" / "fail"
│   └── useDebounce.js
│
└── config/
    ├── qrStyle.js              DEFAULT_STYLE + saare options
    ├── themes.js               6 themes
    └── templates.js            12 templates + categories

tests/                          qr-types, render, templates tests
```

### Data flow

```
Form values --(qr-types/<type>.buildPayload)--> payload text
payload + style --(matrix.js)--> dots grid --(render.js)--> SVG string
SVG --> Preview,  SVG --(validate.js)--> "Scan-tested",  SVG --(export.js)--> file
```

Poora design ek `style` object hai (`config/qrStyle.js`). Theme aur template sirf us object ke tukde hain jo merge hote hain.

---

## Kuch add karna ho to

**Naya QR type:** `src/qr-types/` mein file banao (url.js copy karo) aur `qr-types/index.js` mein jodo.

**Naya theme:** `src/config/themes.js` mein ek object jodo:
```js
{ id: "ocean", name: "Ocean", swatch: ["#0c4a6e", "#0e7490"],
  style: { dots: { shape: "dots", color: "#0c4a6e" }, eyes: { outer: "circle", inner: "circle", matchDots: true } } }
```

**Naya template:** `src/config/templates.js` mein jodo (id, name, category, typeId, description, style). `npm test` check karega ki colours scan-safe hain.

**Nayi picture-art shape:** `src/lib/qr/mask.js` ke `ART_PATHS` mein 0 se 100 ke box wala SVG path jodo, aur `config/qrStyle.js` ke `ART_SHAPE_OPTIONS` mein naam.

**Naya dot shape:** `src/lib/qr/shapes.js` ke `DOT_SHAPES` mein function, aur `DOT_SHAPE_OPTIONS` mein naam. Shape module ke centre ko zaroor dhake, scanner wahi padhta hai.

---

## Scan reliability ke rules (engine inhe khud follow karta hai)

- Code area hamesha light, dots dark. Themes/templates mein dark colours sirf frame pe hain.
- Logo ya picture art on ho to error correction High.
- Logo ke liye saaf ki gayi jagah code ke ~16% se zyada nahi hoti.
- Picture art mein shape ke andar dark dots ka rang gehra aur light dots ka halka rakha jata hai, chahe user koi bhi colour chune.
- Frame ke andar wala QR tile kabhi transparent nahi hota.

Phir bhi print karne se pehle 2-3 phones se scan zaroor karo.

---

## Aage kya

- **Scanner:** camera/image se QR padhna (HTTPS chahiye)
- **My library:** designs save karna (pehle browser mein, phir account)
- **PDF upload:** Cloudflare R2 pe file, phir uska QR
- **Dynamic QR + analytics:** redirect server, scan counting, privacy notice
