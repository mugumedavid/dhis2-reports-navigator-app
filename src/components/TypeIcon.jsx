import React from 'react'
import { getReportType } from '../reportTypes'

// Small inline SVG marking a report's type, drawn in the type's accent colour.
// lineListing = list rows, sqlView = database cylinder, visualization = bars,
// dashboard = grid of tiles.
export default function TypeIcon({ type, size = 16 }) {
    const def = getReportType(type)
    if (!def) return null
    const c = def.accent
    const common = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none' }

    let shape
    switch (type) {
        case 'sqlView':
            shape = (
                <g stroke={c} strokeWidth="1.3" fill="none">
                    <ellipse cx="8" cy="3.4" rx="5" ry="2" />
                    <path d="M3 3.4 V12 c0 1.1 2.24 2 5 2 s5-.9 5-2 V3.4" />
                    <path d="M3 7.7 c0 1.1 2.24 2 5 2 s5-.9 5-2" />
                </g>
            )
            break
        case 'visualization':
            shape = (
                <g fill={c}>
                    <rect x="2" y="8" width="3" height="6" rx="0.6" />
                    <rect x="6.5" y="5" width="3" height="9" rx="0.6" />
                    <rect x="11" y="2" width="3" height="12" rx="0.6" />
                </g>
            )
            break
        case 'dashboard':
            shape = (
                <g fill={c}>
                    <rect x="2" y="2" width="5" height="5" rx="1" />
                    <rect x="9" y="2" width="5" height="5" rx="1" />
                    <rect x="2" y="9" width="5" height="5" rx="1" />
                    <rect x="9" y="9" width="5" height="5" rx="1" />
                </g>
            )
            break
        case 'lineListing':
        default:
            shape = (
                <g fill={c}>
                    <rect x="2" y="3.4" width="12" height="1.7" rx="0.85" />
                    <rect x="2" y="7.15" width="12" height="1.7" rx="0.85" />
                    <rect x="2" y="10.9" width="12" height="1.7" rx="0.85" />
                </g>
            )
    }

    return (
        <svg {...common} style={{ opacity: 0.3 }} aria-label={def.label} role="img">
            {shape}
        </svg>
    )
}
