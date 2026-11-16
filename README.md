# Reports Navigator

A DHIS2 custom app that presents saved reports as a gallery of clickable cards, organised into logical groups.

## Overview

DHIS2 saves line listings, visualizations, SQL views, and dashboards in flat, unlabelled lists that are slow to search through. Reports Navigator gives users a single landing page where saved reports appear as cards grouped into meaningful sections (for example "PrEP", "Deduplication", or any grouping you define). Clicking a card opens the report in its correct native DHIS2 app.

The app is fully generic: it works with any DHIS2 instance and any saved reports. Groups and the reports within them are configured by a superuser and stored in the DHIS2 dataStore. Each user only sees the reports they have read access to, and groups with no visible reports are hidden automatically.

## Features

- Saved reports shown as compact, uniform cards, each with a type marker and a one-click open
- Reports organised into admin-defined groups, in the order you choose
- Per-user visibility: a card only appears if the user can read the underlying report
- Empty groups are hidden automatically
- Collapsible groups on both the gallery and the settings panel
- Live report names and descriptions pulled from DHIS2 at runtime (no stale titles), with optional per-card overrides
- Responsive header: the "Manage reports" button collapses to a cog icon on small screens

## Supported report types

| Type | Opens in | Access resource |
|---|---|---|
| Line Listing | Line Listing app | `eventVisualizations` |
| Visualization | Data Visualizer app | `visualizations` |
| Dashboard | Dashboard app | `dashboards` |
| SQL View | Rendered data table (`/api/sqlViews/<id>/data.html`) | `sqlViews` |

## Requirements

- DHIS2 2.40 to 2.43
- A superuser (holding `ALL` or `F_SYSTEM_SETTING`) to configure groups and reports
- Read access to the DHIS2 dataStore for all users of the app

## Installation

Download the latest release zip and install it via the DHIS2 App Management app, or use the DHIS2 App Hub.

To build from source:

```bash
npm install
npm run build
npm run pack
```

The packaged zip will appear at `reports-navigator-<version>.zip`. Upload it through DHIS2 App Management.

Alternatively, use the included `deploy.sh` script to build, pack, and upload in one step. Edit the credentials at the top of the file to match your instance before running:

```bash
DHIS2_URL="https://your-dhis2-instance"
DHIS2_USER="admin"
DHIS2_PASS="your-password"
```

```bash
bash deploy.sh
```

> Note: after a redeploy that changes manifest fields (such as the app title or icon), restart the DHIS2 container so the app menu picks up the new metadata. Reloading the app alone is not enough.

## First-time setup

1. Log in as a superuser.
2. Open the app and click **Manage reports**.
3. Click **Add group**, then give it an icon (optional emoji), a name, and a description (optional).
4. Inside the group, choose a report type, paste the report's UID, and click **Verify** to confirm it exists and preview its name.
5. Optionally set a display-name override and a card icon, then click **Add to group**.
6. Reorder groups and reports with the up/down chevrons, and click **Save**.

Configuration is stored in the DHIS2 dataStore under the namespace `reports-navigator-app`, key `config`, and is shared across all users of the instance.

### Finding a report's UID

- Line Listing: open the saved list in the Line Listing app and copy the id from the URL (`#/<id>`).
- Visualization: open it in Data Visualizer and copy the id from the URL.
- Dashboard: open it in the Dashboard app and copy the id from the URL.
- SQL View: open it in the Maintenance app under SQL View and copy its id.

## Using the app

1. Browse the groups on the landing page.
2. Collapse groups you are not interested in with the chevron in each group header.
3. Click a card to open that report in a new tab, in its native DHIS2 app.

Non-superusers see a read-only gallery. Superusers additionally see the **Manage reports** button.

## Architecture notes

- No hardcoded report titles. Names and descriptions are resolved at runtime from DHIS2, so cards always reflect the current metadata.
- Per-user visibility relies on DHIS2 metadata list queries returning only objects the caller can read. The app groups configured UIDs by type and issues one filtered `id:in:[...]` query per type, chunked into batches so the request URL stays within server limits even with hundreds of reports.
- Configuration lives entirely in the DHIS2 dataStore (`reports-navigator-app/config`) and is shared across all users.

## Development

```bash
npm install
npm start
```

The dev server proxies to a DHIS2 instance. Set the target in `d2.config.js` or via the `DHIS2_BASE_URL` environment variable.

## AI use

Parts of this project, including portions of the code and this documentation, were produced with the help of AI coding assistants. All AI-assisted output was reviewed and tested by the maintainer before release.

## License

BSD 2-Clause. See [LICENSE](LICENSE).
