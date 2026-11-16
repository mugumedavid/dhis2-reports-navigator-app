# DHIS2 App Hub submission cheat-sheet

Everything needed to submit Reports Navigator at **https://apps.dhis2.org** (sign in with Google or GitHub, then click the upload button). Fill the form with the values below.

## Before you upload: rebuild a fresh zip
Always build the zip immediately before submitting, so it matches the committed source:
```bash
npm install
npm run build
npm run pack
```
This produces `reports-navigator-1.0.0.zip` in the repo root. Upload that file.

## Form field values

| Field | Value |
|---|---|
| **App name** | `Reports Navigator` (must match the `title` in `d2.config.js` exactly) |
| **Version** | `1.0.0` |
| **Minimum DHIS2 version** | `2.40` |
| **Maximum DHIS2 version** | `2.43` (verified on DHIS2 2.43.2.1) |
| **Source code URL** | `https://github.com/mugumedavid/dhis2-reports-navigator-app` |
| **App file (.zip)** | `reports-navigator-1.0.0.zip` (freshly built, repo root) |
| **Developer contact email** | the `author.email` already set in `package.json` |
| **Demo URL** | *(see "Outstanding" below)* |

### Description (paste into the Description field)
> Reports Navigator gives DHIS2 users a single landing page where saved reports appear as clickable cards, grouped into meaningful sections. DHIS2 stores line listings, visualizations, SQL views, and dashboards in flat, unlabelled lists that are slow to search through; this app lets a superuser organise them into named, ordered groups so everyone can find and open the right report in one click.
>
> Who it is for: implementers and administrators who want to give end users a curated, task-oriented view of existing reports without building custom dashboards.
>
> How it works: groups and the reports within them are configured by a superuser and stored in the DHIS2 dataStore (namespace `reports-navigator-app`). Each user only sees cards for reports they have read access to, and empty groups are hidden automatically. Report names and descriptions are pulled live from DHIS2 at runtime, with optional per-card overrides. Clicking a card opens the report in its native DHIS2 app (Line Listing, Data Visualizer, Dashboard) or renders a SQL view.
>
> Requirements: DHIS2 2.40 to 2.43. A superuser (holding `ALL` or `F_SYSTEM_SETTING`) to configure groups; all users need read access to the dataStore. No external services or network connections beyond the DHIS2 instance it runs on.

## Images to upload

| Slot | File |
|---|---|
| **Logo** (>= 512x512) | `docs/apphub/icon-512.png` |
| **Screenshot 1** (thumbnail) | `docs/apphub/screenshots/01-gallery-expanded.png` |
| **Screenshot 2** | `docs/apphub/screenshots/02-groups-overview.png` |
| **Screenshot 3** | `docs/apphub/screenshots/03-browse-cards.png` |
| **Screenshot 4** | `docs/apphub/screenshots/04-manage-groups.png` |

All screenshots are 1280x800.

## Pre-submission checklist
- [x] Generic (no hard-coded metadata; config in dataStore)
- [x] Open source, BSD-2-Clause `LICENSE` in a public repo
- [x] Reproducible build from a fresh clone (lockfile in sync, toolchain pinned)
- [x] `minDHIS2Version` / `maxDHIS2Version` declared and tested (2.40 local, 2.43 on play)
- [x] README documents install, required dataStore access, and config
- [x] AI-use disclosure in README
- [x] Unique 512x512 icon (not the DHIS2 logo)
- [x] 3-5 screenshots with real data
- [ ] **Demo URL** (see below)

## Outstanding
- **Demo URL** — the form asks for a link to a working demo, which needs a *persistent* public DHIS2 instance with the app installed. The play.dhis2.org instances reset nightly, so they are not persistent. Options: use a public production/staging instance, stand up a small public demo, or submit without one (recommended, not strictly mandatory; the reviewer can install from source, review may be slower).

## Alternative: publish from CI
App Platform apps can also publish with `d2-app-scripts publish` using a `D2_APP_HUB_API_KEY`. The first listing still goes through the form above; later versions can be pushed from CI.
