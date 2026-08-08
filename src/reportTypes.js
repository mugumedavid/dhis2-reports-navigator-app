// Registry of supported report types.
//
// Each type maps to:
//   - resource:    the metadata API resource used to (a) check per-user read access
//                  and (b) fetch the live displayName/description
//   - label:       short human label shown as a badge on the card
//   - defaultIcon: emoji used when the admin has not set a custom one
//   - buildLaunchUrl(baseUrl, uid): where clicking the card takes the user
//
// All URL patterns were verified against DHIS2 2.40.10.

export const REPORT_TYPES = {
    lineListing: {
        resource: 'eventVisualizations',
        label: 'Line Listing',
        defaultIcon: '📋',
        accent: '#2563eb', // blue
        // Where to find the UID (shown as the input hint when this type is selected)
        uidHint: 'Line Listing app → open the saved list → copy the id from the URL (#/<id>)',
        buildLaunchUrl: (baseUrl, uid) =>
            `${baseUrl}/dhis-web-line-listing/index.html#/${uid}`,
    },
    sqlView: {
        resource: 'sqlViews',
        label: 'SQL View',
        defaultIcon: '🗃️',
        accent: '#7c3aed', // purple
        uidHint: 'Maintenance app → SQL View → open the view → copy its id',
        // Renders the SQL view's data as an HTML table directly from the API.
        // For MATERIALIZED_VIEW this shows the last-refreshed snapshot.
        buildLaunchUrl: (baseUrl, uid) =>
            `${baseUrl}/api/sqlViews/${uid}/data.html`,
    },
    visualization: {
        resource: 'visualizations',
        label: 'Visualization',
        defaultIcon: '📊',
        accent: '#0891b2', // cyan
        uidHint: 'Data Visualizer app → open the saved visualization → copy the id from the URL',
        buildLaunchUrl: (baseUrl, uid) =>
            `${baseUrl}/dhis-web-data-visualizer/index.html#/${uid}`,
    },
    dashboard: {
        resource: 'dashboards',
        label: 'Dashboard',
        defaultIcon: '📈',
        accent: '#059669', // green
        uidHint: 'Dashboard app → open the dashboard → copy the id from the URL',
        buildLaunchUrl: (baseUrl, uid) =>
            `${baseUrl}/dhis-web-dashboard/index.html#/${uid}`,
    },
}

// Ordered list of { value, label } for use in SingleSelect dropdowns.
export const REPORT_TYPE_OPTIONS = Object.entries(REPORT_TYPES).map(
    ([value, def]) => ({ value, label: def.label })
)

export function getReportType(type) {
    return REPORT_TYPES[type] || null
}
