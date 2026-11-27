# Image provenance

Source-only record for the demonstrational imagery of the SolidCraft portfolio site. `build` excludes `assets/img-src/`, so this file is not published, and the image pipeline reads only `.jpg`, `.jpeg`, and `.png` files inside its group directories.

## Owner-confirmed provenance

- **Origin:** AI-generated demonstrational imagery, as confirmed by the project owner.
- **Tool:** ChatGPT (OpenAI).
- **Intended use:** Illustrative imagery for the SolidCraft portfolio demonstration.

## AI-generated sources

| Group       | Source files                          | Count | Use                                    |
| ----------- | ------------------------------------- | ----: | -------------------------------------- |
| `hero/`     | `hero.jpg`                            |     1 | Home page hero                         |
| `services/` | `<service>.jpg`                       |     6 | Home page service cards                |
| `gallery/`  | `<category>/<prefix>-01…06.jpg` (×6)  |    36 | Service page galleries under `oferta/` |
| `og/`       | `og-1200x630.png`, `og-1200x1200.png` |     2 | Open Graph artwork                     |

## Non-generated sources

`screenshots/` (`desktop-1280x720.png`, `mobile-720x1280.png`) contains actual application screenshots captured for the PWA manifest, as confirmed by the project owner. They are not AI-generated.

## Unavailable evidence

The following details were not recorded for the AI-generated sources and are not available in the repository:

- Model version, generation dates, prompts, seeds, or job identifiers.
- Post-processing applied before the masters were committed.
- Usage-rights or licensing confirmation beyond the owner's statement of the generation tool.

This file is the provenance of record. The previous record was removed in commit `06936bc`; this record replaces it with owner-confirmed information only.
