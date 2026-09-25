# Halo Detailing — website (HTML build)

Open `index.html` in any browser. Everything the site needs is inside this folder. Apart from Google Fonts, nothing loads from a remote URL.

```
index.html            Home
services.html         Services, packages, FAQ
work.html             Before/after sliders + gallery
contact.html          Contact options + WhatsApp booking form
assets/css/           global.css (tokens + all standard sections) + one file per showpiece
assets/js/            site.js (menu, header, reveals, form) + one file per showpiece
assets/img/           Optimised JPEGs (max 1800px wide) + SVG logo mark and favicon
assets/video/         hero-studio-loop.mp4 (5s seamless loop, 340 KB)
media-originals/      Full-resolution originals of every generated asset (not used by the pages)
```

---

## Before launch: replace the placeholders

The phone/WhatsApp number (0305 5730305, used in links as `923055730305`) and the contact name (Mohammad Soban Nadeem) are already set. Search and replace the rest across the four HTML files:

| Find | Replace with |
|---|---|
| `hello@yourdomain.pk` | Your email |
| `Your City` | Your city / service area |
| `Mon – Sat: 9 am – 7 pm` / `Sunday: by appointment` | Your real hours (also `openingHours` in the JSON-LD) |
| `Rs. X,XXX` / `Rs. XX,XXX` | Starting prices for each service and package |
| `https://www.instagram.com/` etc. | Your social profile URLs |
| `[Placeholder]` testimonials (home page) | Real customer reviews, with permission |

**Images:** all photos are AI-generated. The before/after pairs and the gallery in particular should be replaced with photos of your own jobs before launch, because customers will read them as proof of your work. Keep the same file names (or update the `src`) and the sliders keep working.

**Social sharing:** once the domain is live, make `og:image` an absolute URL (`https://yourdomain.pk/assets/img/og-share.jpg`). Yoast or Rank Math does this for you in WordPress.

---

## Rebuilding in WordPress + Elementor

### Global settings
- **Site Settings → Global Colors:** Primary `#22E07A`, Secondary `#123524`, Text `#ECF1EC`, Accent `#A7F3C9`. Also add Ink `#07110C`, Surface `#0D1F16`, Muted `#8FA398` and Paper `#F2F5F0` as custom colours.
- **Site Settings → Global Fonts:** Primary = Unbounded 600/700, Secondary/Text = Manrope 400–700, Accent = Manrope 700.
- **Site Settings → Custom CSS** (or a child theme stylesheet): paste `assets/css/global.css`. Every element already has its class, so the styles apply as soon as you enter the same class under **Advanced → CSS Classes**.
- Breakpoints already match Elementor's defaults: tablet ≤ 1024px, mobile ≤ 767px.

### Standard sections (native widgets only)
Every standard section is a flex container. There is no CSS grid.

| HTML block | Elementor build |
|---|---|
| `.site-header` | Theme Builder → Header: Site Logo (or Heading) + Nav Menu + Button |
| `.trust` | Container (row, wrap) → 4 × Icon Box, icon position left |
| `.service-row` | Container (HTML tag `a`, link to the service anchor) → Heading + Text Editor + Icon |
| `.testimonial` | Testimonial widget ×3 |
| `.cta-band` / `.page-hero` | Container with background image + background overlay → Heading, Text, Buttons |
| `.service-detail` | Container row (reverse on every other row) → Image + inner container (Heading, Text, Icon List, Heading for price, Button) |
| `.package` | Container card (or Pro Price Table) → Heading, Text, Icon List, Button |
| `.faq-item` | Accordion widget |
| `.gallery-row` | Container row → 2 × Image |
| `.contact-card` | Container link → Icon + Heading + Text |
| `.booking-form` | Pro Form widget (see below) |
| `.site-footer` | Theme Builder → Footer: Headings, Icon List, Social Icons; `.footer-wordmark` is a Heading with Text Stroke |
| `.reveal` | Motion Effects → Entrance Animation "Fade In Up" |
| `.whatsapp-float` / `.mobile-actions` | Pro Floating Buttons, or a sticky container with 1–2 Buttons |

### Showpieces: content in widgets, behaviour in one HTML widget
Build the content with normal widgets and give each the class shown. Then add **one HTML widget** in that section containing `<style>` (the showpiece CSS file) and `<script>` (the showpiece JS file). The code only looks for classes, so you edit text, images and buttons in the normal widgets. Adding a slider or a step needs no code change.

**1. Halo hero** (`showpiece-hero.css` + `showpiece-hero.js`)
- Container `.hero`, with background video `assets/video/hero-studio-loop.mp4` and fallback image `hero-studio-suv.jpg`. Alternatively, keep the `<video class="hero-video">` inside a `.hero-media` container.
- Inner container `.hero-content` → Heading `.hero-eyebrow` · Heading (H1) `.hero-headline` (wrap the accent word in `<span class="hero-headline-accent">`) · Text `.hero-subheading` · Buttons in `.hero-buttons` · Icon List `.hero-specs`
- The ring-light colours come from `--halo-glow` and `--halo-core` on `.hero`.

**2. Before/after** (`showpiece-compare.css` + `showpiece-compare.js`)
- For each comparison, add a container `.compare-item` holding: Image `.compare-before` · Image `.compare-after` · caption container `.compare-caption` with Text `.compare-label .compare-label-before` · Text `.compare-label .compare-label-after` · Heading `.compare-title` · Text `.compare-text`
- Duplicate the container to add another comparison.

**3. The Halo Process** (`showpiece-process.css` + `showpiece-process.js`)
- Container `.process` → `.process-track` → `.process-steps` → one container `.process-step` per step, each holding: Heading `.process-step-number` · Heading `.process-step-title` · Text `.process-step-text` · Image `.process-step-image`
- Duplicate a step to add a fifth. Desktop gets the sticky reveal automatically, and tablet/mobile show the plain stacked list.

### Booking form
The HTML form opens WhatsApp with the customer's details already typed. The site has no server, so nothing is stored. In WordPress, use the Elementor Pro **Form** widget with the same fields (name, phone, car, service, date, message) and an email action. You can also keep the WhatsApp behaviour by leaving `site.js` in place and giving the form the class `booking-form`.

---

## Generated media log (Higgsfield)
- 57 credits used in total.
- Nano Banana Pro (2K): 19 original images, plus 5 edits (3 "before" versions made from the "after" photos so the framing matches exactly, 1 redo of the interior "before", 1 to remove branding from the inspection shot).
- Flux Kontext: 1 alternative interior "before". It wasn't used because it was lower resolution and slightly misaligned.
- Kling 3.0 Pro: 1 hero video, 5s, silent, with the hero still as both first and last frame so it loops seamlessly.
- Originals are in `media-originals/` (not referenced by the pages). Optimised copies are in `assets/`.
