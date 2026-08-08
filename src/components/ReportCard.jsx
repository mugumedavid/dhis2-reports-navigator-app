import React, { useState } from 'react'
import { getReportType } from '../reportTypes'
import TypeIcon from './TypeIcon'

// A single clickable report card (light theme, smoke-grey, fixed uniform size).
// Layout: the type icon sits top-left; the name's first line clears it (via
// text-indent) and any wrapped line flows underneath it. The text area is a fixed
// 3 lines total — name takes up to 2 lines when a description is present (3 when
// not), and the description fills whatever lines remain below the name.
export default function ReportCard({ report, baseUrl }) {
    const def = getReportType(report.type)
    const [hover, setHover] = useState(false)
    if (!def) return null

    const customIcon = report.icon || '' // if set, replaces the type icon in the slot
    const name = report.nameOverride || report.displayName || report.uid
    const description = report.descriptionOverride || report.description || ''
    const url = def.buildLaunchUrl(baseUrl, report.uid)

    function open() {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    function onKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open()
        }
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            title={`${def.label} — open "${name}"`}
            style={{ ...styles.card, ...(hover ? styles.cardHover : {}) }}
        >
            <div style={styles.body}>
                <span style={styles.iconSlot}>
                    {customIcon ? (
                        <span style={styles.emoji}>{customIcon}</span>
                    ) : (
                        <TypeIcon type={report.type} size={16} />
                    )}
                </span>
                <span style={{ ...styles.open, opacity: hover ? 1 : 0 }}>↗</span>

                <div
                    style={{
                        ...styles.name,
                        WebkitLineClamp: description ? 2 : 3,
                    }}
                >
                    {name}
                </div>
                {description ? (
                    <div style={styles.desc}>{description}</div>
                ) : null}
            </div>
        </div>
    )
}

const LINE = 18 // px per text line (both name and description share this)

const styles = {
    card: {
        background: '#f4f5f7',
        border: 'none',
        borderRadius: 10,
        padding: '9px 11px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        transition: 'background 0.15s ease, box-shadow 0.15s ease',
    },
    cardHover: {
        background: '#eceef1',
        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.08)',
    },
    // Fixed 3-line text area; overflow hidden caps the name+description total.
    body: {
        position: 'relative',
        height: LINE * 3,
        overflow: 'hidden',
    },
    iconSlot: {
        position: 'absolute',
        top: 1,
        left: 0,
        display: 'inline-flex',
        alignItems: 'center',
    },
    emoji: { fontSize: 15, lineHeight: 1 },
    open: {
        position: 'absolute',
        top: 0,
        right: 0,
        fontSize: 15,
        color: '#98a2b3',
        transition: 'opacity 0.15s ease',
    },
    name: {
        fontSize: 13.5,
        fontWeight: 600,
        color: '#101828',
        lineHeight: `${LINE}px`,
        textIndent: 23, // first line clears the icon; wrapped lines sit under it
        paddingRight: 16, // keep text clear of the open hint
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    desc: {
        fontSize: 12.5,
        color: '#667085',
        lineHeight: `${LINE}px`,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
}
