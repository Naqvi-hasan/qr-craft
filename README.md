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
npm test         # 41 unit tests
npm run build    # production build
```

**Pages**

| Address | Kya hai |
|---|---|
| `/` | QR Studio |
| `/templates` | 12 ready-made designs |
| `/cards` | Printable WiFi card, business card, UPI payment stand |
| `/scanner` | Camera ya photo se QR padhna |
| `/library` | Saved designs (sirf is browser mein) |
| `/privacy` | Privacy page |
| `/wifi-qr-code-generator` jaise 13 pages | Har QR type ka Google-friendly page |
| `/sitemap.xml`, `/robots.txt` | Search engines ke liye, apne aap bante hain |

**Links jo Studio kholte hain:** `/#wifi` (type), `/?template=cafe-menu#url` (template), `/?design=<id>#url` (library se), `/?prefill=...#wifi` (scanner se).

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

**Scanner (`/scanner`):** camera (sirf "Start camera" dabane pe chalu) ya photo/screenshot upload/paste. Link apne aap nahi khulta: pehle asli address, WiFi password, contact ya UPI payee dikhta hai. Short links, http, IP address, look-alike domain aur `javascript:` links pe warning. "Make a QR like this" se scanned data Studio mein bhar jata hai.

**My Library (`/library`):** Studio mein "Save to library", phir yahan open, rename, duplicate, PNG download, delete. Backup (JSON file) aur Restore. Data browser ke IndexedDB mein, server pe kuch nahi.

**Printable cards (`/cards`):** WiFi card (A6), business card (8.9 × 5.1 cm, vCard QR), UPI payment stand (A6). 7 colours, 3 dot styles, scan check. PNG, single PDF, ya A4 print sheet (business card 10, A6 cards 4 per page) 300 DPI pe.

**SEO:** har QR type ka alag page (how-to, FAQ, FAQ structured data), canonical links, sitemap, robots, social preview image (`public/og.png`), site icon, footer mein saare generators ke links.

**Analytics:** Vercel Web Analytics (cookie-free page views).

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
├── app/ (naye)
│   ├── [slug]/page.js          13 per-type SEO pages (/wifi-qr-code-generator...)
│   ├── cards/, scanner/, library/, privacy/   naye pages
│   ├── sitemap.js, robots.js   /sitemap.xml, /robots.txt
│   └── icon.svg                Browser tab icon
│
├── components/
│   ├── Icon.js                 Saare icons
│   ├── scanner/                ScannerApp, CameraScanner, ImageScanner, ScanResult
│   ├── library/                LibraryApp, LibraryCard
│   ├── cards/                  CardsApp
│   ├── seo/SeoContent.js       How-to + FAQ + JSON-LD on type pages
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
│   ├── qr/decoder.js           jsQR wrapper (scanner + scan check)
│   ├── scan/parse.js           Scanned text -> WiFi/contact/UPI/link + warnings
│   ├── library/db.js, model.js IndexedDB storage + record helpers, backup
│   ├── cards/cards.js, export.js  Card layouts (mm), PNG/PDF/A4 sheet
│   ├── studioLink.js           Links that open the Studio with data
│   ├── site.js                 SITE_URL (canonical, sitemap)
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
    ├── templates.js            12 templates + categories
    └── seo.js                  13 type pages ka text (title, description, steps, FAQ)

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

## Deploy ke baad ek baar ka setup

1. **Analytics on karo:** Vercel → project → **Analytics** tab → **Enable**. Agle deploy ke baad visits dikhne lagenge.
2. **Apna domain (jab lo):** Vercel → Settings → Domains mein jodo, aur Settings → Environment Variables mein `NEXT_PUBLIC_SITE_URL` = `https://aapka-domain.com` daal ke redeploy karo. Domain nahi hai to kuch mat karo, Vercel ka address apne aap use hota hai.
3. **Google Search Console:** search.google.com/search-console → **URL prefix** → apna site address → verification mein **HTML tag** chuno. Tag ke `content="..."` wala code copy karke Vercel mein `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` naam se environment variable banao, redeploy karo, phir Verify dabao. Uske baad **Sitemaps** mein `sitemap.xml` submit karo.

---

## Aage kya

- **Batch E:** Bulk QR (CSV se ZIP), PWA (install as app), Hindi UI, naye types (Event, Google Review, YouTube)
- **Account + cloud library**
- **PDF upload:** Cloudflare R2 pe file, phir uska QR
- **Dynamic QR + analytics:** redirect server, scan counting, privacy notice
