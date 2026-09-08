import React, { useState } from 'react'
import { IconChevronDown16, IconChevronRight16 } from '@dhis2/ui'
import ReportCard from './ReportCard'

// Renders one logical group: a pronounced, collapsible heading (chevron + emoji
// badge + name + count + description) and a grid of cards. Only rendered when the
// group has visible reports.
export default function GroupSection({ group, reports, baseUrl, useSqlViewerApp }) {
    const [collapsed, setCollapsed] = useState(false)

    function toggle() {
        setCollapsed(c => !c)
    }

    function onKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
        }
    }

    return (
        <section style={styles.section}>
            <div
                style={styles.header}
                onClick={toggle}
                onKeyDown={onKeyDown}
                role="button"
                tabIndex={0}
                aria-expanded={!collapsed}
                title={collapsed ? 'Expand group' : 'Collapse group'}
            >
                <span style={styles.chevron}>
                    {collapsed ? (
                        <IconChevronRight16 color="#667085" />
                    ) : (
                        <IconChevronDown16 color="#667085" />
                    )}
                </span>
                {group.icon ? <span style={styles.badge}>{group.icon}</span> : null}
                <div style={styles.headText}>
                    <div style={styles.titleLine}>
                        <h2 style={styles.title}>{group.name}</h2>
                        <span style={styles.count}>{reports.length}</span>
                    </div>
                    {group.description ? (
                        <p style={styles.description}>{group.description}</p>
                    ) : null}
                </div>
            </div>
            {!collapsed ? (
                <div style={styles.grid}>
                    {reports.map(report => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            baseUrl={baseUrl}
                            useSqlViewerApp={useSqlViewerApp}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    )
}

const styles = {
    section: { marginBottom: 40 },
    header: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        paddingBottom: 16,
        marginBottom: 20,
        borderBottom: '1px solid #eaecf0',
        userSelect: 'none',
    },
    chevron: { display: 'inline-flex', marginRight: 10, flexShrink: 0 },
    badge: {
        width: 44,
        height: 44,
        borderRadius: 10,
        background: '#f2f4f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
        marginRight: 16,
    },
    headText: { minWidth: 0 },
    titleLine: { display: 'flex', alignItems: 'center', gap: 10 },
    title: { fontSize: 19, fontWeight: 700, color: '#101828', margin: 0 },
    count: {
        fontSize: 12,
        fontWeight: 600,
        color: '#667085',
        background: '#f2f4f7',
        borderRadius: 20,
        padding: '2px 9px',
        lineHeight: 1.6,
    },
    description: { fontSize: 13.5, color: '#667085', margin: '3px 0 0' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 12,
        alignItems: 'start',
    },
}
