# SolidCraft — Workmanship Photography Brief (IMP-DESIGN-03, Stage A)

**Date:** 2026-11-12
**Improvement:** IMP-DESIGN-03 — Define and apply a coherent workmanship photography system (`IMPROVEMENTS-DESIGN.md`)
**Stage:** A — art direction, asset audit, and generation plan. No image, HTML, or pipeline change is made in this stage.
**Status:** Stage C in progress — the hero and six home service images are integrated (section 5.4); the 36 gallery images are outstanding. IMP-DESIGN-03 is not complete.
**Direction:** Measured Craft (`IMPROVEMENTS-DESIGN.md`, sections 5–6).

Stages: **A** (this document) → **B** generation and review of new AI-generated demonstrational images → **C** integration into `assets/img-src/`, regeneration, and HTML content updates.

## 1. Current inventory and audit

### 1.1 Scope and evidence

- **Canonical sources in scope:** 43 JPG files — `assets/img-src/hero/` (1), `assets/img-src/services/` (6; `oferta/` at the Stage A audit), `assets/img-src/gallery/` (36, six per service). `og/` and `screenshots/` sources are out of scope.
- **Dimensions:** hero 3200×1800 (16:9); home services 1600×1200 (4:3); gallery 2048×1536 (4:3). Each source already matches its largest pipeline output.
- **Origin:** all 43 sources carry XMP `xmp:CreatorTool` "Canva (Renderer)", with `Attrib:Created` dates from 2025-08-20 to 2025-10-18. No provenance, licence, or rights record exists in the repository.
- **Consumers (all verified in source):**

| Role         | Sources                        | Consumer                                                                      | Text contract                                                                                              |
| ------------ | ------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Hero         | `hero/hero.jpg`                | `index.html` `#strona-glowna` `.hero__bg`, plus the AVIF `<link rel=preload>` | `alt=""`, `aria-hidden="true"` (decorative)                                                                |
| Home service | `services/*.jpg` (6)           | `index.html` `#oferta`, one per `#oferta-*` card, inside the `#kontakt` link  | `alt` per image; the link name comes from its `aria-label` ("Zamów wycenę — …")                            |
| Gallery      | `gallery/<prefix>-0N.jpg` (36) | `oferta/*.html` `#galeria`, six `.gallery-item` links per page                | `alt` per image (also copied to the lightbox image); `data-lb-caption` per item; `href` to the 2048 px JPG |

- **Gallery text shared by all six pages:** heading "Galeria realizacji" and lead "Kilka ujęć z ostatnich prac — więcej na życzenie."
- **`data-lb-caption`:** present on all 36 items, but no script or stylesheet reads it (searched `js/`, `css/`, `scripts/`); captions are markup content and are not displayed today.
- **Rendered crop:** hero `object-fit: cover` at `object-position: 50% 40%` below 1024 px and centred from 1024 px; cards and gallery tiles `aspect-ratio: 4/3` with `object-fit: cover`; lightbox `object-fit: contain`. At 390×844 the 16:9 hero renders about 1,050 CSS px wide (IMPROVEMENTS-DESIGN.md, section 3), so the cover crop shows only the central ≈37% of the image width.

### 1.2 Issue codes

**S** subject outside the page's service scope · **I** unrelated infrastructure or industrial work · **P** product or still life on a plain background · **T** stock or staged people (posed faces, DIY couples) · **F** fantasy, showroom, or CGI interior · **N** non-Polish (North-American) building context · **D** duplicate or near-duplicate · **M** decorative corner mark · **A** `alt` or caption does not match the image · **C** crop or focal-point problem · **R** presented as recent work on a demonstrational site (applies to all 36 gallery images).

### 1.3 Hero and home service images

This table records the former sources audited in Stage A; their replacements are listed in section 5.4.

| Source                   | Consumer               | Depicts                                                                 | Alignment  | Issues                                                     |
| ------------------------ | ---------------------- | ----------------------------------------------------------------------- | ---------- | ---------------------------------------------------------- |
| `hero/hero.jpg`          | `#strona-glowna`       | Styled minimalist living room with TV; no work visible; high-key        | Misaligned | F, C (mobile crop shows wall and TV), bright ground (P-01) |
| `oferta/bathroom.jpg`    | `#oferta-lazienki`     | Dark luxury bathroom, freestanding tub, wide view                       | Partial    | F (hotel scale), no craft; alt implies a completed job     |
| `oferta/painting.jpg`    | `#oferta-malowanie`    | Soft round brush macro on white; reads as a cosmetic brush              | Misaligned | P                                                          |
| `oferta/kafelki.jpg`     | `#oferta-kafelkowanie` | Palatial black-and-white marble mosaic hall floor                       | Partial    | F, A (alt says "tarasu i kuchni")                          |
| `oferta/electrition.jpg` | `#oferta-elektryka`    | Smiling electrician giving a thumbs-up beside a panel, white background | Misaligned | T, P                                                       |
| `oferta/plumbing.jpg`    | `#oferta-hydraulika`   | Fittings and braided hoses on a white table                             | Misaligned | P, M, A (alt "Hydraulik w pracy"; no person shown)         |
| `oferta/remonty.jpg`     | `#oferta-kompleksowe`  | Hand sketching a kitchen with a red line-drawing overlay composite      | Misaligned | F (composite), M                                           |

### 1.4 Service galleries

| Source       | Depicts                                                   | Alignment  | Issues        |
| ------------ | --------------------------------------------------------- | ---------- | ------------- |
| `bathr-01`   | Modern bathroom with glass shower and LED, wide           | Partial    | F, M          |
| `bathr-02`   | Copper bathtub under a rock waterfall with plants         | Misaligned | F, M          |
| `bathr-03`   | White-marble bathroom with walk-in shower                 | Partial    | N, M          |
| `bathr-04`   | Grey-tiled bathroom with vessel basin and tub             | Partial    | M             |
| `bathr-05`   | Beige-tiled bathroom with corner tub and wall decor       | Partial    | N, M          |
| `bathr-06`   | Attic bathroom with freestanding tub, CGI look            | Partial    | F, M          |
| `paint-01`   | Painter in a hard hat rolling yellow paint                | Partial    | M             |
| `paint-02`   | Styled lounge with arch and pampas grass                  | Misaligned | F, M          |
| `paint-03`   | Smiling couple painting a wall (DIY)                      | Misaligned | T, M          |
| `paint-04`   | Room protected with film before painting                  | Aligned    | M             |
| `paint-05`   | Exterior facade renovation of a timber house              | Misaligned | S, N, M       |
| `paint-06`   | CGI split image, unfinished versus finished room          | Misaligned | F, D, M       |
| `tilling-01` | Tiler laying terrace tiles on adhesive                    | Aligned    | M             |
| `tilling-02` | Empty room with glossy white floor                        | Partial    | M, glare      |
| `tilling-03` | Showroom tile sample wall                                 | Misaligned | P, M          |
| `tilling-04` | Dark-tiled bathroom (overlaps the Łazienki subject)       | Partial    | —             |
| `tilling-05` | Tiler laying large-format tiles with levelling clips      | Aligned    | M             |
| `tilling-06` | Branded impact driver screwing into chipboard panel       | Misaligned | S, A, M, logo |
| `elec-01`    | Multimeter measurement in an industrial switchboard       | Partial    | M             |
| `elec-02`    | Lineman on a bucket truck at overhead lines               | Misaligned | I, N, M       |
| `elec-03`    | Solar panel installation on a roof                        | Misaligned | I, M          |
| `elec-04`    | Industrial control cabinet wiring                         | Partial    | I, M          |
| `elec-05`    | Electrician in a hard hat at wall junction boxes          | Partial    | T, M          |
| `elec-06`    | Team installing solar panels                              | Misaligned | I, M          |
| `plum-01`    | Industrial hydraulic hoses on yellow machinery            | Misaligned | I, A, M       |
| `plum-02`    | Hands tightening a sink trap with a wrench                | Aligned    | M             |
| `plum-03`    | Plumber routing pipes in a brick wall                     | Aligned    | M             |
| `plum-04`    | Man sitting on a kitchen floor with a tablet and tool bag | Misaligned | T, M          |
| `plum-05`    | Couple watching a plumber fit a kitchen tap               | Partial    | T, M          |
| `plum-06`    | Fittings and spanner on a dark wood table                 | Partial    | P, M          |
| `reno-01`    | Kitchen cabinets and island under installation            | Partial    | N, D, M       |
| `reno-02`    | Same file content as `paint-06`                           | Misaligned | F, D, M       |
| `reno-03`    | Finished black kitchen in an apartment                    | Partial    | M             |
| `reno-04`    | Finished attic open space with island                     | Partial    | M             |
| `reno-05`    | White kitchen with island                                 | Partial    | N, M          |
| `reno-06`    | Same kitchen scene as `reno-01`, other angle              | Partial    | N, D, M       |

### 1.5 Findings

- **Alignment:** 5 aligned, 20 partial, 18 misaligned of 43; no home-service image is fully aligned.
- **Scope coverage:** no gallery shows its scope in process. Łazienki shows six finished bathrooms and no waterproofing; Elektryka shows overhead lines and photovoltaics (3 of 6) although its scope is residential installations, circuits, lighting, and measurements; Hydraulika opens with industrial hydraulics.
- **Corner marks:** 37 of 43 sources carry an orange glyph in the bottom-right corner (house-and-square on `remonty.jpg` and all galleries except `tilling-04`; gear on `plumbing.jpg` and all `elec-*`).
- **Duplicates:** `paint-06` and `reno-02` are pixel-identical; `reno-01` and `reno-06` show the same scene.
- **Context:** several interiors and exteriors are North-American; workwear, tools, and people come from unrelated stock sets with no shared crew look, light, or grade.
- **Framing:** all six gallery leads describe the images as recent work, and several `alt` texts state completed renovations.
- **Generated outputs:** 206 of the 210 committed JPG outputs in `assets/img/{hero,oferta,gallery}/` still carry the Canva XMP block, including the author name, which the current pipeline would not write (section 5.3).

## 2. Shared art-direction brief

### 2.1 Subject strategy

The images document **how the work is done**, not lifestyle results. Each gallery is a short sequence through its page's scope cards, from preparation to finish, and every image links to one scope card. Subjects are hands, tools, and materials at close and medium distance, followed by finished details; wide finished rooms are rare and plain.

- **Setting:** ordinary Polish residential interiors — apartment blocks, tenement flats, and single-family houses. Room sizes, windows, radiators, and fittings are typical for Poland.
- **Technical realism:** EU fittings throughout — type E sockets in Ø60 flush boxes; DIN-rail breakers and RCDs in residential flush-mounted boards; conductor colours brown/black/grey (L), blue (N), green-yellow (PE); PEX, PE-RT, multilayer, and PP pipes; wall-hung WC frames; large-format porcelain (60×120 cm and similar).
- **People:** one consistent crew look — plain charcoal or dark navy workwear without logos, grey work gloves where the task requires them, no jewellery. Show hands, forearms, and partial figures from the side or behind; faces never appear in frame.
- **Tools:** realistic and unbranded, in neutral black, grey, or aluminium; no legible text or logos.
- **Honesty:** images illustrate typical work stages; nothing implies a specific client, address, or completed project.

### 2.2 Mood

Calm, focused, orderly, competent: a quiet working day. The work area is clean, materials are stacked neatly, and floors and joinery are protected. No staged emotion, posing, or drama.

### 2.3 Lighting profiles

- **L1 — Window daylight (default):** one soft daylight source from a window to one side of the frame, 5200–5600 K, natural falloff, fill from room bounce only.
- **L2 — Raking daylight:** low-angle daylight across a surface to reveal flatness and texture (gładź, paint, tile planes, joints).
- **L3 — Daylight plus task light:** daylight ambient with one neutral work lamp (4000–5000 K) for enclosed work (distribution board, under a sink, inside a cabinet). No coloured light.

Practical lighting may appear only where it is the subject (LED profile, finished bathroom), at 3000–4000 K, without changing the overall neutral balance.

### 2.4 Grade (one grade for the whole set)

- Warm-neutral: whites slightly warm but never yellow; shadows neutral to slightly warm, never blue.
- Mid-key with moderate contrast; highlights unclipped (walls at or below about 240/255 sRGB); blacks slightly lifted (about 12–18/255).
- Saturation slightly reduced; material colours stay true. Fine natural grain is allowed.
- Not allowed: HDR halos, teal-orange looks, vignettes, lens flare, tilt-shift, heavy bokeh.
- **Both themes:** each image must sit calmly on the light ground (`#f6f5f1`) and the dark ground (`#0b1220`). Avoid near-white or near-black areas larger than about 15% of the frame that touch an image edge.

### 2.5 Shot distances and proportions

| Type | Definition                                                     | Depth of field            | Share of the 43 images |
| ---- | -------------------------------------------------------------- | ------------------------- | ---------------------- |
| H    | Hands at work, close or medium-close; partial figure allowed   | Working plane fully sharp | 22 (51%)               |
| D    | Material or process detail without hands (installed, prepared) | Shallow but readable      | 8 (19%)                |
| F    | Finished detail at medium-close or medium distance             | Moderate                  | 8 (19%)                |
| W    | Wide finished or in-progress space, 24–28 mm equivalent        | Deep; verticals straight  | 5 (12%)                |

Target ranges for any later change: H 45–55%, D 15–25%, F 15–25%, W at most 15%.

### 2.6 Crop and focal-point logic

- **Masters at the exact pipeline aspect and at least the largest output size:** hero 16:9 at ≥3200×1800; home service 4:3 at ≥1600×1200; gallery 4:3 at ≥2048×1536. The pipeline then applies no crop and no upscaling (section 5.3).
- **Focal point** is stated per image as (x%, y%) from the top-left corner.
- **Gallery item 01** is the future lead image (IMP-DESIGN-06): keep the subject inside the central 60% of the width and 89% of the height, so that 3:2 and 4:5 crops remain possible.
- **Other gallery items:** focal point within the central third; no essential detail in the outer 8% of any edge.
- **Home service images** must read at 400×300 and as smaller index thumbnails (IMP-DESIGN-05): one dominant subject filling at least 40% of the frame, with simple shapes and no fine detail essential to meaning.
- **Hero:** see HERO-01; composed for the current centred cover crop and for the IMP-DESIGN-04 text field.

### 2.7 Global exclusions (X-G)

- Product-on-white or catalogue still lifes; tile or paint sample showrooms.
- Unrelated infrastructure or industry: overhead lines, photovoltaics, industrial cabinets, machinery hydraulics, construction cranes.
- Fantasy, luxury-showroom, or CGI-perfect interiors; before/after split composites; sketch or line-drawing overlays.
- Faces, posed smiles, thumbs-up, DIY couples, clients in frame.
- Corner marks, watermarks, logos, legible brand names, legible text on labels, packaging, screens, or drawings (meter displays show plausible digits only).
- North-American context: clapboard houses, US outlets, US-style kitchens and vanities.
- Unsafe practice: work on visibly live parts, missing eye protection while cutting, ladder misuse.
- Amber or orange as a dominant colour; amber is reserved for interface action.
- **AI artefacts:** malformed hands or fingers, impossible tool geometry, warped tile grids or uneven joint widths, pipes or cables that end nowhere, duplicated objects, inconsistent light direction.

### 2.8 Text rules

- **`alt`:** Polish; describes what is visible and the work stage; at most about 120 characters; no "zdjęcie", no claim of a specific or completed client project. The hero keeps `alt=""`.
- **`data-lb-caption`:** Polish, format "Etap lub zakres — opis", with the work stage stated truthfully; no "realizacja", "nasza", or "ostatnie prace".
- **Gallery heading and lead:** carry the demonstrational label once per page (owner decision D3, section 7).

## 3. Future shot list

**Conventions.** IDs are stable shot labels; home service images map to the approved English basenames in `services/` (D5); gallery images keep their current basenames. Fields are role, target, scope anchor, subject and stage, shot and focal point, light, materials and tools, mood and exclusions, `alt`, and caption. Mood is the shared mood (section 2.2) unless an override is noted. Exclusions are X-G plus any item-specific exclusions. Crop: hero 16:9 at ≥3200×1800; home service images 4:3 at ≥1600×1200; gallery images 4:3 at ≥2048×1536. Gallery items run in work-stage order, and item 01 is the lead.

### 3.1 Hero

#### HERO-01 — `hero/hero.jpg`

- **Role / target:** hero · `index.html` `#strona-glowna` · cross-service craft anchor (tiling).
- **Subject / stage:** a tiler's forearms and hands seating a large-format warm-grey porcelain floor tile onto combed adhesive beside the previous tile, levelling clips along the joint, an aluminium spirit level lying along the edge · stage: tile laying.
- **Shot / focal:** medium-close, low camera (about 40 cm above the floor) · focal (58%, 65%); subject group within x 40–75%; upper 45% and left 35% calm (softly defocused primed wall and window light) for the text field. The hands stay inside the current 390 px cover window (x ≈31–69%).
- **Light:** L1 from camera-left, morning; mid-key with no specular hot spots behind the text area (supports P-01).
- **Materials / tools:** porcelain tile, grey cement adhesive with notched ridges, grey or translucent levelling clips, spirit level, charcoal workwear and knee pad partly visible.
- **Mood / exclusions:** shared mood · no laser beams, no wet-gloss drama, no amber clothing.
- **`alt`:** `""` (unchanged, decorative) · **caption:** n/a.
- **Future crop:** a separate 4:5 portrait master only when IMP-DESIGN-04 adds a pipeline variant (section 5.3).

### 3.2 Home service images (`index.html` `#oferta`)

#### HOME-LAZ — `services/bathrooms.jpg` · `#oferta-lazienki`

- **Subject / stage:** finished walk-in shower corner — light stone-effect large-format porcelain, recessed niche with 45° mitred edges, stainless linear drain, matte black thermostatic mixer, clean silicone joint · stage: finished. Shot type F.
- **Shot / focal:** medium-close, slightly high angle · focal (50%, 55%) on the niche corner and drain line.
- **Light:** L1 from the right with subtle L2 to show flat tile planes.
- **Materials / tools:** porcelain, stainless drain, matte black mixer, silicone.
- **Mood / exclusions:** quiet and exact · no freestanding tub, plants, candles, styled towels, or hotel scale.
- **`alt`:** "Prysznic bez brodzika z odpływem liniowym i podświetlaną wnęką wykończoną płytkami wielkoformatowymi"

#### HOME-MAL — `services/painting.jpg` · `#oferta-malowanie`

- **Subject / stage:** a hand peeling masking tape from a freshly painted warm-grey wall, revealing a straight colour edge against the white ceiling · stage: finishing (cut lines). Shot type H.
- **Shot / focal:** close, strong diagonal tape line · focal (50%, 50%) at the peel point.
- **Light:** L2 from the left.
- **Materials / tools:** masking tape, matte wall paint, white ceiling.
- **Mood / exclusions:** shared mood · no paint tins with labels, no drips or splatter.
- **`alt`:** "Zdejmowanie taśmy malarskiej odsłania równą linię odcięcia koloru przy suficie"

#### HOME-KAF — `services/tiling.jpg` · `#oferta-kafelkowanie`

- **Subject / stage:** a gloved hand combing cement adhesive with a notched trowel on a wall, a large tile resting ready beside it · stage: tile setting. Shot type H.
- **Shot / focal:** close, adhesive ridges as a strong pattern · focal (50%, 50%) on the trowel edge.
- **Light:** L2 from the left to model the ridges.
- **Materials / tools:** notched steel trowel, grey adhesive, porcelain tile, primed wall.
- **Mood / exclusions:** shared mood · no decorative mosaics, no showroom floors.
- **`alt`:** "Glazurnik rozprowadza klej pacą zębatą przed osadzeniem płytki ściennej"

#### HOME-ELE — `services/electrical.jpg` · `#oferta-elektryka`

- **Subject / stage:** hands with an insulated screwdriver tightening a terminal of a modular breaker on a DIN rail in a residential flush-mounted distribution board; wiring neatly combed; blank labels · stage: board assembly (de-energised). Shot type H.
- **Shot / focal:** close · focal (52%, 50%) on the screwdriver tip.
- **Light:** L3.
- **Materials / tools:** residential board, RCD and MCB row, EU-coloured conductors, insulated screwdriver.
- **Mood / exclusions:** shared mood · no industrial cabinets, no sparks, no legible labels.
- **`alt`:** "Elektryk dokręca zacisk wyłącznika w uporządkowanej rozdzielnicy mieszkaniowej"

#### HOME-HYD — `services/plumbing.jpg` · `#oferta-hydraulika`

- **Subject / stage:** hands closing an unbranded press tool on a multilayer pipe fitting in a wall chase, with insulated supply pipes running neatly alongside · stage: first-fix installation. Shot type H.
- **Shot / focal:** close · focal (50%, 52%) on the press jaw.
- **Light:** L1, with L3 if the chase is deep.
- **Materials / tools:** multilayer pipe, press fitting, pipe insulation sleeves, press tool.
- **Mood / exclusions:** shared mood · no loose fittings on a table, no industrial pipework.
- **`alt`:** "Hydraulik zaciska złączkę na rurze wielowarstwowej podczas prowadzenia instalacji w ścianie"

#### HOME-REM — `services/renovations.jpg` · `#oferta-kompleksowe`

- **Subject / stage:** a room at the final finishing stage — hands in the foreground fitting a mitred oak skirting board at a corner, with smooth painted walls, an oak floor, and window daylight behind; a protective board on part of the floor · stage: final finishing. Shot type H (medium-wide).
- **Shot / focal:** medium-wide, low camera · focal (40%, 65%) on the mitre; the room fills the rest.
- **Light:** L1.
- **Materials / tools:** oak skirting, mitre joint, oak floor, painted walls.
- **Mood / exclusions:** shared mood · no sketch overlays, no furniture styling.
- **`alt`:** "Montaż listwy przypodłogowej na etapie końcowych prac w wyremontowanym pokoju"

### 3.3 Łazienki — `oferta/lazienki.html` `#galeria` (`data-lb="lazienki"`)

Service exclusions: freestanding luxury tubs, waterfalls, plants as decor, attic CGI, North-American vanities.

#### LAZ-01 — `gallery/bathr-01.jpg` · `#hydroizolacja` · lead

- **Subject / stage:** a gloved hand brushing sealing tape into the first coat of grey-blue liquid membrane at the inside wall-floor corner of a shower zone; a pre-formed inner corner piece visible · stage: waterproofing. Shot type H.
- **Shot / focal:** medium-close · focal (50%, 55%).
- **Light:** L1 from camera-left.
- **Materials / tools:** liquid membrane, sealing tape and corner, brush, sloped screed.
- **`alt`:** "Wtapianie taśmy uszczelniającej w pierwszą warstwę hydroizolacji w narożniku strefy prysznica"
- **Caption:** "Hydroizolacja strefy prysznica — taśma i narożnik wtopione w pierwszą warstwę folii w płynie przed układaniem płytek."

#### LAZ-02 — `gallery/bathr-02.jpg` · `#instalacje`

- **Subject / stage:** a wall-hung WC frame fixed to the wall, with a capped supply connection, drain bend, and nearby flush boxes, before boarding · stage: first-fix installations. Shot type D.
- **Shot / focal:** medium · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** WC frame, supply pipe with test plug, drain bend, flush boxes.
- **`alt`:** "Stelaż podtynkowy WC z podejściami wodnym i kanalizacyjnym przed zabudową ściany"
- **Caption:** "Instalacje przed zabudową — stelaż podtynkowy WC z podejściami wod-kan przygotowany do obudowy płytą."

#### LAZ-03 — `gallery/bathr-03.jpg` · `#ukladanie-plytek`

- **Subject / stage:** a tiler's hands setting the second half of a 45° mitred external corner on a shower niche and checking the meeting edges · stage: tiling. Shot type H.
- **Shot / focal:** close · focal (48%, 50%) on the mitre line.
- **Light:** L1 with slight L2.
- **Materials / tools:** porcelain with mitred edges, spacers, small square.
- **`alt`:** "Dopasowanie docinków pod 45° na narożniku wnęki prysznicowej"
- **Caption:** "Układanie płytek — docinki pod 45° na narożniku wnęki, bez listwy, z równą spoiną."

#### LAZ-04 — `gallery/bathr-04.jpg` · `#bialy-montaz`

- **Subject / stage:** hands fitting the cover plate of a wall-mounted thermostatic shower mixer on finished tiles, with protective film on the adjacent tiles · stage: fixture installation. Shot type H.
- **Shot / focal:** medium-close · focal (52%, 48%).
- **Light:** L1.
- **Materials / tools:** thermostatic mixer, cover plate, porcelain wall.
- **`alt`:** "Montaż baterii termostatycznej na wykończonej ścianie z płytek"
- **Caption:** "Biały montaż — osadzenie baterii termostatycznej na podejściach przygotowanych przed układaniem płytek."

#### LAZ-05 — `gallery/bathr-05.jpg` · `#bialy-montaz`

- **Subject / stage:** finished shower floor — stainless linear drain along the wall, tiles laid to an even fall, uniform joints, silicone joint at the wall, dry surface · stage: finished. Shot type F.
- **Shot / focal:** close, slightly high angle · focal (50%, 55%).
- **Light:** L2 along the drain.
- **Materials / tools:** linear drain, porcelain floor, silicone.
- **`alt`:** "Odpływ liniowy przy ścianie w posadzce z płytek ze spadkiem i równymi spoinami"
- **Caption:** "Detal wykończenia — odpływ liniowy przy ścianie, posadzka ze spadkiem i silikon w narożniku."

#### LAZ-06 — `gallery/bathr-06.jpg` · scope overview

- **Subject / stage:** a finished compact apartment bathroom (about 4–5 m²) with a walk-in shower behind a fixed glass panel, light large-format porcelain, wall-hung WC, compact vanity, and mirror · stage: finished. Shot type W.
- **Shot / focal:** wide from the doorway, 24–28 mm equivalent, verticals straight · focal (50%, 55%).
- **Light:** small-window daylight plus a 3000–4000 K mirror light.
- **Materials / tools:** porcelain, glass, white ceramics, matte fittings.
- **Mood / exclusions:** shared mood · no styling props, no luxury scale.
- **`alt`:** "Wykończona łazienka w mieszkaniu z prysznicem bez brodzika, podwieszaną miską WC i płytkami wielkoformatowymi"
- **Caption:** "Efekt końcowy — kompaktowa łazienka z prysznicem bez brodzika, stelażem WC i płytkami wielkoformatowymi."

### 3.4 Malowanie & gładzie — `oferta/malowanie.html` `#galeria` (`data-lb="malowanie"`)

Service exclusions: facades, styled lounges, DIY couples, paint brand labels, saturated feature colours.

#### MAL-01 — `gallery/paint-01.jpg` · `#gladzie-gipsowe` · lead

- **Subject / stage:** hands skimming gypsum finish onto a wall with a wide stainless finishing trowel, under raking light · stage: skim coat. Shot type H.
- **Shot / focal:** medium-close · focal (50%, 52%).
- **Light:** L2 from camera-left.
- **Materials / tools:** gypsum finish, finishing trowel, hawk or bucket edge.
- **`alt`:** "Nakładanie gładzi gipsowej szeroką pacą na ścianę w świetle bocznym"
- **Caption:** "Gładź gipsowa — wyrównanie ściany szeroką pacą przed szlifowaniem i gruntowaniem."

#### MAL-02 — `gallery/paint-02.jpg` · `#przygotowanie-podloza`

- **Subject / stage:** a crack reinforced with mesh tape and filler, a primer tray, masking tape along a window frame, and film on the floor · stage: substrate preparation. Shot type D.
- **Shot / focal:** close · focal (45%, 50%).
- **Light:** L1.
- **Materials / tools:** mesh tape, filler, primer, masking tape, protective film.
- **`alt`:** "Rysa wzmocniona siatką i szpachlą obok zabezpieczonej taśmą ramy okiennej"
- **Caption:** "Przygotowanie podłoża — naprawa rysy z siatką zbrojącą i zabezpieczenie stolarki przed malowaniem."

#### MAL-03 — `gallery/paint-03.jpg` · `#gladzie-gipsowe`

- **Subject / stage:** the head of a dust-extraction wall sander with its hose resting on a smooth, flat skim coat · stage: dust-free sanding. Shot type D.
- **Shot / focal:** close · focal (50%, 50%).
- **Light:** L2.
- **Materials / tools:** sander head, extraction hose, sanded gypsum surface.
- **`alt`:** "Szlifierka z odciągiem pyłu na wyrównanej gładzi w świetle bocznym"
- **Caption:** "Szlif bezpyłowy — szlifierka z odciągiem pyłu i kontrola płaszczyzny w świetle bocznym."

#### MAL-04 — `gallery/paint-04.jpg` · `#malowanie-sciany-sufity`

- **Subject / stage:** a painter seen from the side or behind (shoulder and arm) rolling a second coat of warm-neutral paint with an extension pole, the floor protected · stage: painting. Shot type H.
- **Shot / focal:** medium · focal (55%, 45%) on the roller.
- **Light:** L1.
- **Materials / tools:** roller, extension pole, paint grid, protective film.
- **`alt`:** "Malarz nakłada wałkiem drugą warstwę farby na ścianę w zabezpieczonym pomieszczeniu"
- **Caption:** "Malowanie ścian — drugie krycie wałkiem po zagruntowaniu i szlifie gładzi."

#### MAL-05 — `gallery/paint-05.jpg` · `#dodatki-detale`

- **Subject / stage:** a crisp boundary between a muted clay or green-grey accent wall and a white-painted door casing · stage: finished detail. Shot type F.
- **Shot / focal:** close · focal (50%, 50%) on the edge line.
- **Light:** L2.
- **Materials / tools:** matte accent paint, satin trim paint, door casing.
- **`alt`:** "Równe odcięcie koloru ściany akcentowej przy pomalowanej ościeżnicy"
- **Caption:** "Dodatki i detale — ściana akcentowa z równym odcięciem przy odnowionej ościeżnicy."

#### MAL-06 — `gallery/paint-06.jpg` · scope overview

- **Subject / stage:** an empty, freshly painted apartment bedroom — warm off-white walls, white ceiling, raking daylight showing a uniform finish, protective film rolled up in a corner, folded stepladder · stage: finished. Shot type W.
- **Shot / focal:** wide, verticals straight · focal (50%, 50%).
- **Light:** L1 or L2.
- **Materials / tools:** painted walls and ceiling, rolled film, stepladder.
- **`alt`:** "Pusty pokój po malowaniu ścian i sufitu w ciepłej, jasnej bieli"
- **Caption:** "Efekt końcowy — pokój po gładziach i malowaniu, jednolity kolor i połysk w świetle dziennym."

### 3.5 Kafelkowanie — `oferta/kafelkowanie.html` `#galeria` (`data-lb="kafelkowanie"`)

Service exclusions: sample walls, glossy empty showrooms, furniture assembly, bathrooms duplicating the Łazienki subjects.

#### KAF-01 — `gallery/tilling-01.jpg` · `#ukladanie` · lead

- **Subject / stage:** a tiler setting a large wall tile along a reference batten and pencil line, holding a spirit level against the row, with spacers in the joints · stage: tiling. Shot type H.
- **Shot / focal:** medium · focal (50%, 50%).
- **Light:** L1 from camera-right.
- **Materials / tools:** porcelain wall tile, batten, spirit level, spacers, adhesive.
- **`alt`:** "Glazurnik osadza płytkę ścienną wzdłuż linii odniesienia i sprawdza ją poziomicą"
- **Caption:** "Układanie płytek — pierwszy rząd osadzony na łacie i linii odniesienia, z kontrolą poziomu."

#### KAF-02 — `gallery/tilling-02.jpg` · `#docinki`

- **Subject / stage:** hands scoring a porcelain tile on a manual rail cutter · stage: cutting. Shot type H.
- **Shot / focal:** close · focal (50%, 55%) on the scoring wheel.
- **Light:** L1.
- **Materials / tools:** manual rail cutter, porcelain tile, pencil mark.
- **`alt`:** "Docinanie płytki gresowej na przecinarce ręcznej"
- **Caption:** "Docinki — precyzyjne cięcie płytki na przecinarce ręcznej przed montażem przy narożniku."

#### KAF-03 — `gallery/tilling-03.jpg` · `#docinki`

- **Subject / stage:** a finished external wall corner with a brushed aluminium trim and an even joint along its full height · stage: finished detail. Shot type F.
- **Shot / focal:** close, along the corner · focal (50%, 50%).
- **Light:** L2.
- **Materials / tools:** aluminium trim, porcelain, grout.
- **`alt`:** "Zewnętrzny narożnik ściany wykończony szczotkowaną listwą aluminiową"
- **Caption:** "Docinki i detale — narożnik zewnętrzny z listwą aluminiową i równą spoiną na całej wysokości."

#### KAF-04 — `gallery/tilling-04.jpg` · `#hydroizolacja`

- **Subject / stage:** a sealing collar set into liquid membrane around a floor drain on a sloped screed, with a brush aside · stage: waterproofing. Shot type D.
- **Shot / focal:** close, top-down at a slight angle · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** drain body, sealing collar, liquid membrane, brush.
- **`alt`:** "Mankiet uszczelniający wokół odpływu w warstwie hydroizolacji posadzki"
- **Caption:** "Hydroizolacja — mankiet uszczelniający wokół odpływu wtopiony w folię w płynie."

#### KAF-05 — `gallery/tilling-05.jpg` · `#fugi`

- **Subject / stage:** a rubber grout float pressing cement grout diagonally into the joints of floor tiles, with a sponge bucket edge in frame · stage: grouting. Shot type H.
- **Shot / focal:** close · focal (50%, 52%).
- **Light:** L2.
- **Materials / tools:** grout float, cement grout, porcelain floor, sponge.
- **`alt`:** "Fugowanie posadzki z płytek gumową pacą prowadzoną po przekątnej"
- **Caption:** "Fugi i uszczelnienia — wypełnianie spoin fugą cementową, paca prowadzona po przekątnej."

#### KAF-06 — `gallery/tilling-06.jpg` · scope overview

- **Subject / stage:** a finished hallway floor in large-format porcelain, with joints aligned to the walls and skirting fitted · stage: finished. Shot type W.
- **Shot / focal:** wide, low-medium camera, verticals straight · focal (50%, 60%).
- **Light:** L2 along the floor.
- **Materials / tools:** porcelain floor, skirting.
- **`alt`:** "Posadzka z płytek wielkoformatowych w korytarzu z równymi, prostymi spoinami"
- **Caption:** "Efekt końcowy — posadzka z płytek wielkoformatowych, spoiny w osi ścian i cokoły."

### 3.6 Elektryka — `oferta/elektryka.html` `#galeria` (`data-lb="elektryka"`)

Service exclusions: overhead lines, photovoltaics, industrial cabinets, hard-hat portraits, live work, non-EU conductor colours or sockets.

#### ELE-01 — `gallery/elec-01.jpg` · `#instalacje` · lead

- **Subject / stage:** hands fixing cables with clips in a wall chase that leads to Ø60 flush boxes at switch height, on a ceramic-block or concrete wall · stage: first-fix wiring. Shot type H.
- **Shot / focal:** medium-close · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** installation cable, clips, flush boxes, chased wall.
- **`alt`:** "Elektryk mocuje przewody w bruździe prowadzącej do puszek podtynkowych"
- **Caption:** "Instalacje od podstaw — przewody w bruzdach i puszki podtynkowe przed tynkowaniem."

#### ELE-02 — `gallery/elec-02.jpg` · `#instalacje`

- **Subject / stage:** an assembled residential distribution board with the cover off — DIN rails with RCDs and breakers, N and PE bars, neatly combed EU-coloured conductors, blank labels · stage: after assembly, before the cover is fitted. Shot type D.
- **Shot / focal:** close, frontal · focal (50%, 48%).
- **Light:** L3.
- **Materials / tools:** board enclosure, RCDs and breakers, busbars, conductors.
- **`alt`:** "Rozdzielnica mieszkaniowa z wyłącznikami różnicowoprądowymi i uporządkowanym okablowaniem"
- **Caption:** "Rozdzielnia — zabezpieczenia nadprądowe i różnicowoprądowe na szynie, przewody ułożone przed założeniem osłony."

#### ELE-03 — `gallery/elec-03.jpg` · `#przerobki`

- **Subject / stage:** hands joining stripped conductors with unbranded lever connectors inside a flush box before the socket insert is fitted · stage: new circuit point. Shot type H.
- **Shot / focal:** close · focal (50%, 52%).
- **Light:** L1 with L3.
- **Materials / tools:** flush box, lever connectors, conductors, wire stripper.
- **`alt`:** "Łączenie przewodów w puszce podtynkowej przed montażem gniazda"
- **Caption:** "Przeróbki i nowe obwody — połączenia w puszce przygotowane pod nowe gniazdo."

#### ELE-04 — `gallery/elec-04.jpg` · `#pomiary`

- **Subject / stage:** hands holding installation-tester probes at a type E socket; the display shows plausible digits with no brand · stage: measurements before handover. Shot type H.
- **Shot / focal:** close · focal (55%, 50%).
- **Light:** L1.
- **Materials / tools:** installation tester, probes, socket.
- **`alt`:** "Pomiar instalacji miernikiem przy gniazdzie na etapie odbioru"
- **Caption:** "Pomiary — kontrola obwodu miernikiem instalacji przed sporządzeniem protokołu."

#### ELE-05 — `gallery/elec-05.jpg` · `#oswietlenie`

- **Subject / stage:** a lit LED strip in a recessed aluminium profile with diffuser in a plasterboard ceiling cove, giving an even line with no visible dots · stage: finished lighting. Shot type F.
- **Shot / focal:** close-medium · focal (50%, 45%).
- **Light:** dim L1 plus 3000–4000 K LED as subject.
- **Materials / tools:** aluminium profile, diffuser, plasterboard.
- **`alt`:** "Taśma LED w aluminiowym profilu dająca równą linię światła"
- **Caption:** "Oświetlenie — taśma LED w profilu aluminiowym z dyfuzorem, równa linia światła bez punktów."

#### ELE-06 — `gallery/elec-06.jpg` · `#przerobki`

- **Subject / stage:** a double socket and a switch installed level and in one line on a smooth painted wall above a kitchen worktop · stage: finished. Shot type F.
- **Shot / focal:** medium · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** type E sockets, switch, painted wall, worktop edge.
- **`alt`:** "Gniazda i łącznik zamontowane w jednej linii na wykończonej ścianie"
- **Caption:** "Efekt końcowy — osprzęt zamontowany w osi i w poziomie na wykończonej ścianie."

### 3.7 Hydraulika — `oferta/hydraulika.html` `#galeria` (`data-lb="hydraulika"`)

Service exclusions: industrial hydraulics, fittings still lifes, posed clients, tablets, kitchen showrooms.

#### HYD-01 — `gallery/plum-01.jpg` · `#instalacje` · lead

- **Subject / stage:** hands connecting PEX circuits to a manifold with valves inside an installation cabinet · stage: first-fix installation. Shot type H.
- **Shot / focal:** medium-close · focal (50%, 50%).
- **Light:** L3.
- **Materials / tools:** manifold, valves, PEX pipes, spanner.
- **`alt`:** "Podłączanie rur PEX do rozdzielacza z zaworami w szafce instalacyjnej"
- **Caption:** "Instalacje od podstaw — rozdzielacz z zaworami i podłączone obwody rur PEX."

#### HYD-02 — `gallery/plum-02.jpg` · `#instalacje`

- **Subject / stage:** supply pipes in blue and red insulation sleeves, routed in parallel and clipped in wall chases before plastering · stage: pipe routing. Shot type D.
- **Shot / focal:** medium · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** insulated pipes, clips, chased wall.
- **`alt`:** "Rury w otulinach poprowadzone równolegle w bruzdach przed tynkowaniem"
- **Caption:** "Trasy instalacji — rury w otulinach poprowadzone i zamocowane przed zakryciem."

#### HYD-03 — `gallery/plum-03.jpg` · `#przerobki-naprawy`

- **Subject / stage:** two spanners tightening a compression fitting on a replaced pipe section under a kitchen sink · stage: repair. Shot type H.
- **Shot / focal:** close · focal (50%, 55%).
- **Light:** L3.
- **Materials / tools:** compression fitting, pipe section, two spanners.
- **`alt`:** "Dokręcanie złączki przy wymianie odcinka rury pod zlewem"
- **Caption:** "Przeróbki i naprawy — wymiana odcinka rury i nowa złączka pod zlewem kuchennym."

#### HYD-04 — `gallery/plum-04.jpg` · `#uszczelnienia-proby`

- **Subject / stage:** a pressure gauge connected to the installation through a test pump, with a steady needle and capped outlets · stage: pressure test. Shot type D.
- **Shot / focal:** close · focal (50%, 45%) on the gauge face.
- **Light:** L1.
- **Materials / tools:** pressure gauge, test pump hose, test plugs.
- **`alt`:** "Manometr podłączony do instalacji podczas próby ciśnieniowej"
- **Caption:** "Uszczelnienia i próby — próba ciśnieniowa instalacji przed zakryciem i sporządzeniem protokołu."

#### HYD-05 — `gallery/plum-05.jpg` · `#bialy-montaz`

- **Subject / stage:** hands connecting a chrome bottle trap under a wall-hung basin to the drain outlet · stage: fixture installation. Shot type H.
- **Shot / focal:** medium-close · focal (50%, 55%).
- **Light:** L1 with L3.
- **Materials / tools:** bottle trap, basin, drain outlet.
- **`alt`:** "Montaż syfonu pod umywalką podwieszaną"
- **Caption:** "Biały montaż — podłączenie syfonu umywalkowego do podejścia kanalizacyjnego."

#### HYD-06 — `gallery/plum-06.jpg` · `#bialy-montaz`

- **Subject / stage:** a finished wall-hung basin with tap and chrome trap, clean silicone at the tiled wall · stage: finished. Shot type F.
- **Shot / focal:** medium · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** basin, tap, trap, porcelain wall.
- **`alt`:** "Umywalka podwieszana z baterią i syfonem po zakończeniu białego montażu"
- **Caption:** "Efekt końcowy — umywalka z baterią i syfonem, szczelne połączenia i silikon przy ścianie."

### 3.8 Remonty kompleksowe — `oferta/remonty.html` `#galeria` (`data-lb="remonty"`)

Service exclusions: CGI split images, North-American kitchens, repeated scenes, showroom kitchens.

#### REM-01 — `gallery/reno-01.jpg` · `#zakres` · lead

- **Subject / stage:** an apartment mid-renovation — fresh plaster, flush boxes in place, the floor protected, materials stacked neatly, a stepladder · stage: after first-fix and plastering. Shot type W.
- **Shot / focal:** wide, verticals straight · focal (50%, 55%); key elements within the central 60% width.
- **Light:** L1.
- **Materials / tools:** plastered walls, protection boards, stacked materials, stepladder.
- **`alt`:** "Mieszkanie w trakcie remontu z uporządkowanymi materiałami i zabezpieczoną podłogą"
- **Caption:** "Pełny zakres prac — mieszkanie po pracach instalacyjnych i tynkarskich, przed wykończeniem."

#### REM-02 — `gallery/reno-02.jpg` · `#projekty`

- **Subject / stage:** a site table with a tile sample, an oak board, an unbranded paint swatch fan, a printed floor plan with unreadable linework, and a tape measure · stage: design and material selection. Shot type D.
- **Shot / focal:** close-medium, slightly high angle · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** samples, floor plan, tape measure.
- **`alt`:** "Próbki płytek, deski i kolorów farby obok rzutu mieszkania na stole roboczym"
- **Caption:** "Projekty i wybór materiałów — zestawienie próbek do zatwierdzenia przed zamówieniem."

#### REM-03 — `gallery/reno-03.jpg` · `#koordynacja`

- **Subject / stage:** a hand holding a laser distance meter against a door opening, next to a pencil mark on the reveal · stage: site measurement. Shot type H.
- **Shot / focal:** close · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** laser distance meter (no legible display text), pencil, plastered reveal.
- **`alt`:** "Pomiar otworu drzwiowego dalmierzem laserowym przed zamówieniem materiałów"
- **Caption:** "Koordynacja i harmonogram — pomiary na miejscu przed zamówieniem drzwi i materiałów."

#### REM-04 — `gallery/reno-04.jpg` · `#zakres`

- **Subject / stage:** hands setting an interior door frame plumb with a spirit level and wedges · stage: joinery fitting. Shot type H.
- **Shot / focal:** medium · focal (48%, 45%).
- **Light:** L1.
- **Materials / tools:** door frame, spirit level, wedges, mounting foam gun at rest.
- **`alt`:** "Osadzanie ościeżnicy drzwi wewnętrznych z kontrolą pionu"
- **Caption:** "Prace wykończeniowe — osadzenie ościeżnicy w pionie i poziomie przed montażem skrzydła."

#### REM-05 — `gallery/reno-05.jpg` · `#zakres`

- **Subject / stage:** a kitchen fit-out detail — worktop joint, tiled splashback, and sockets above the worktop in one line, with matte fronts · stage: finished detail. Shot type F.
- **Shot / focal:** medium · focal (50%, 50%).
- **Light:** L1.
- **Materials / tools:** worktop, splashback tiles, sockets, cabinet fronts.
- **`alt`:** "Detal zabudowy kuchennej z blatem, okładziną ścienną i gniazdami nad blatem"
- **Caption:** "Zabudowa i instalacje — blat, okładzina i osprzęt elektryczny zgrane w jednej linii."

#### REM-06 — `gallery/reno-06.jpg` · `#gwarancja`

- **Subject / stage:** a living room after full renovation — smooth walls, oak floor, skirting, ceiling lights, window daylight, minimal or no furniture · stage: ready for handover. Shot type W.
- **Shot / focal:** wide, verticals straight · focal (50%, 55%).
- **Light:** L1.
- **Materials / tools:** painted walls, oak floor, skirting, light fittings.
- **`alt`:** "Pokój po remoncie kompleksowym z gładkimi ścianami i podłogą z dębowej deski"
- **Caption:** "Efekt końcowy — wnętrze gotowe do odbioru po remoncie kompleksowym."

## 4. Stage B — generation plan

1. **Style key (first):** generate HERO-01, LAZ-01 (H), and ELE-02 (D) first. They fix the crew look, the light profiles, and the grade. The owner approves the style key before any further batch.
2. **Batch 1 — home service images (6):** generate together to check cross-service consistency at thumbnail size.
3. **Batches 2–7 — one gallery per batch:** Elektryka, then Hydraulika (largest scope gaps and highest technical-plausibility risk), then Łazienki, Kafelkowanie, Malowanie & gładzie, and Remonty kompleksowe.
4. **Per-batch review:**
   - **Contact sheet:** one per service, holding the six gallery images, the home image, and the style key, shown at 400×300 and at full 2048 px on both theme grounds (`#f6f5f1` and `#0b1220`).
   - **Checklist:** the subject matches the shot spec and its scope card; light and grade match the style key; the crop and focal point meet section 2.6; no X-G or service exclusion is present; technical details are correct (section 2.1); there are no AI artefacts.
   - **Output:** regenerate rejects individually. Keep candidates and rejects outside the repository until approval.
5. **Final cross-set review:** all 43 images on one sheet; confirm the type proportions (section 2.5), crew and grade consistency, and that no two images repeat a scene.
6. **Record while generating:** for each approved image, the tool, model and version, date, prompt, seed or job ID, and any post-processing (section 6).

## 5. Stage C — integration plan

### 5.1 Files and content

- **Sources:** replace the 43 files in `assets/img-src/{hero,services,gallery}/` with the approved masters; home service images use the approved English basenames, and gallery basenames are kept unless D5 decides otherwise.
- **Outputs:** regenerate `assets/img/{hero,services,gallery}/` as described in section 5.3, never by hand.
- **`alt`:** update 6 on `index.html` and 36 across `oferta/*.html` from section 3; the hero keeps `alt=""`.
- **Captions:** update all 36 `data-lb-caption` values from section 3.
- **Gallery heading and lead:** update on all six service pages if D3 is approved.
- **Provenance:** add the record described in section 6.
- **Unchanged:** `width` and `height` attributes, `srcset` and `sizes` contracts, `SERVICE_SIZES` and `GALLERY_SIZES`, the hero preload, and the lightbox contract (`.gallery-item`, `data-lb`, `data-lb-caption`, 2048 px `href`). Aspect ratios do not change.

### 5.2 Verification for Stage C

- `npm run check:html`, `npm run qa:functional` (lightbox scenarios), `npm run qa:a11y`, `npm run build:dist`, and `npm run format:check`.
- A before/after `npm run qa:lighthouse` for hero LCP.
- `node scripts/images.js build --dry-run` reports 0 obsolete outputs.
- A metadata check confirms that the regenerated outputs carry no XMP or EXIF.
- One contact sheet per service in both themes, and a visual check of the hero at 390, 768, 1024, and 1440 px.

### 5.3 Image-pipeline implications (verified in `scripts/images.js` and `sw.js`)

- **Existing outputs are never overwritten.** `buildForFile` skips any output path that already exists, and pruning removes only names that the current sources would not produce. Replacing a source under the same basename therefore leaves the old AVIF, WebP, and JPG outputs in place. This is evidenced by the Canva XMP still present in 206 of 210 committed JPG outputs, while a scratch run of the same sharp calls writes neither XMP nor EXIF. Stage C must run `npm run images:clean` and then `npm run images:build`.
- **`images:clean` empties all five owned directories,** including `og/` and `screenshots/`, and `images:build` regenerates them from their sources. Review that binary diff (expect 630 regenerated hero, services, and gallery files plus the `og/` and `screenshots/` variants).
- **Renaming sources** lets pruning remove the old outputs automatically, but requires updating every `srcset`, `src`, `href`, and the preload in the HTML, plus the `bathr-0N` selectors in `scripts/functional/lightbox.mjs`. The home service sources were renamed in `services/` with these updates; gallery basenames, including `tilling`, are unchanged, which keeps the gallery stage to content only.
- **Crop and scale:** the pipeline resizes with `fit: cover, position: center` and enlarges smaller inputs, so masters must already have the target aspect and at least the largest size (section 2.6). Accepted inputs are `.jpg`, `.jpeg`, and `.png`.
- **No staging inside source directories.** Every image file in `hero/`, `services/`, or `gallery/` becomes an output set. A portrait hero master placed in `hero/` would be cropped to 16:9 and published, so a portrait master waits until IMP-DESIGN-04 adds a variant to `scripts/images.js`.
- **Service worker:** images are runtime-cached cache-first by URL. Same-URL replacements reach returning visitors only when `CACHE_VERSION` changes, which happens because Stage C also changes the precached HTML. An image-only swap without HTML changes would keep the old cached images for returning visitors.
- **Documentation gap:** `docs/settings.md` and `README.md` say to run `images:build` after changing source images, without noting the skip-existing behaviour. Correcting that, or adding a regeneration option to the pipeline, is a separate owner decision (D8).

### 5.4 Home stage — hero and six home service images

- **Status:** integrated and verified on 2026-11-12; the 36 gallery images are outstanding.
- **Sources:** `hero/hero.jpg` (HERO-01) and `services/{bathrooms,painting,tiling,electrical,plumbing,renovations}.jpg` (HOME-LAZ, HOME-MAL, HOME-KAF, HOME-ELE, HOME-HYD, HOME-REM) at 3200×1800 and 1600×1200, so no output is upscaled.
- **Outputs:** the `scripts/images.js` group is renamed to `services` with unchanged sizes. `assets/img/hero/` (18 files) and `assets/img/services/` (72 files) were regenerated through `images:clean` → `images:build`, and the re-encoded `gallery/`, `og/`, and `screenshots/` outputs were restored to their committed files.
- **Markup:** the six `index.html` cards reference `assets/img/services/` and use the section 3.2 `alt` text; the hero markup, its preload, and the `oferta/*.html` routes are unchanged.
- **Accepted deviations from the shot specs:** HERO-01 has a busy upper-left field (window, lit niche, bucket) instead of a calm text field; HOME-LAZ includes a trailing plant; HOME-ELE shows legible breaker ratings; the crew wears orange glove cuffs.
- **Light-theme correction:** the hero title takes off-white ink, the light-theme scrim is raised to `--overlay-a: 0.46`, and "Sprawdź ofertę" becomes a light chip with dark ink, so the title matches the dark theme's sampled contrast.
- **Open:** the hero lead and focus ring remain weak over the photograph in places; P-01 remains open for IMP-DESIGN-04.

## 6. Provenance record (proposed format)

- **Status:** `assets/img-src/PROVENANCE.md` records the seven home-stage images; gallery rows are added with the gallery stage.
- **Location:** `assets/img-src/PROVENANCE.md`, next to the canonical sources, following the `assets/fonts/README.md` precedent. `build:dist` excludes `assets/img-src/`, so the record is not published, and `scripts/images.js` does not scan the `assets/img-src/` root.
- **Header statement:** all hero, home service, and gallery images are AI-generated demonstrational illustrations; they depict no real project, client, address, person, or brand. The record also notes that they replace Canva exports dated 2025-08-20 to 2025-10-18.
- **Table, one row per image:**

| ID     | Source file            | Role / page                   | Tool and model (version) | Generated  | Prompt ref | Seed / job ID | Post-processing   | Approved   | Terms note                                |
| ------ | ---------------------- | ----------------------------- | ------------------------ | ---------- | ---------- | ------------- | ----------------- | ---------- | ----------------------------------------- |
| LAZ-01 | `gallery/bathr-01.jpg` | Gallery lead, `lazienki.html` | e.g. tool and model v1   | YYYY-MM-DD | P-LAZ-01   | …             | crop 4:3; grade G | YYYY-MM-DD | Commercial and demo use permitted (owner) |

- **Prompts:** the full prompt text for each `Prompt ref` is kept in the same file, under a per-batch heading with per-image differences.
- **Metadata:** generated outputs are written without metadata, so this repository record is the provenance of record.

## 7. Owner decisions required before Stage B / C

1. **D1 — Shared visual direction (section 2):** subject strategy, crew look without faces, lighting profiles, one warm-neutral grade, crop rules, and type proportions.
2. **D2 — Shot list (section 3):** the 43 specifications, service by service, including the subject choices for HERO-01 and the six home images.
3. **D3 — Demonstrational wording:** the gallery heading and lead on all six pages. The current "Galeria realizacji" and "Kilka ujęć z ostatnich prac — więcej na życzenie." present the images as recent work. Proposed heading: "Etapy i detale prac". Proposed lead: "Ilustracje demonstracyjne pokazujące kolejne etapy i standard wykonania." Captions follow section 2.8.
4. **D4 — Provenance:** the record format and location (section 6), the generation tool, and confirmation that its terms permit this use. The owner confirms the rights; this brief does not assess them.
5. **D5 — Filenames:** keep the current basenames (recommended for Stage C), or rename them as a separate change with HTML and test updates.
6. **D6 — Hero scope:** approve the 16:9 HERO-01 now, and defer the portrait master to IMP-DESIGN-04. Under the current centred hero layout, text legibility still depends on the overlay (P-01).
7. **D7 — Copy outside this task:** the Elektryka home card description ("Przeróbki instalacji, białe montaże i próby szczelności.") uses plumbing wording, and the Hydraulika description is generic. Decide whether to correct them with Stage C or in a separate content task, so that the home image and its text describe the same scope.
8. **D8 — Pipeline handling:** accept the `images:clean` → `images:build` procedure for Stage C, and decide whether to document the skip-existing behaviour in `docs/settings.md` or add a regeneration option as a separate task.
9. **D9 — Caption visibility:** `data-lb-caption` is not displayed today. Showing captions in the lightbox would be a separate UX change and is not part of IMP-DESIGN-03.
