import React, { useEffect, useState, useCallback } from 'react'
import { useDataQuery, useDataEngine, useConfig } from '@dhis2/app-runtime'
import {
    CircularLoader,
    NoticeBox,
    AlertBar,
    AlertStack,
    Button,
    IconSettings24,
} from '@dhis2/ui'
import GroupSection from './components/GroupSection'
import ConfigPanel from './components/ConfigPanel'
import {
    currentUserQuery,
    isSuperuser,
    loadConfig,
    saveConfig,
    fetchReadableReports,
} from './api'

export default function App() {
    const { loading, error, data } = useDataQuery(currentUserQuery)
    const engine = useDataEngine()
    const { baseUrl } = useConfig()

    const [config, setConfig] = useState(null) // { groups: [...] }
    const [readable, setReadable] = useState(null) // Map<uid, {displayName, description}>
    const [resolving, setResolving] = useState(true)
    const [showConfig, setShowConfig] = useState(false)
    const [alerts, setAlerts] = useState([])
    const [narrow, setNarrow] = useState(
        typeof window !== 'undefined' && window.innerWidth < 640
    )

    // On small screens the "Manage reports" button collapses to just the cog icon.
    useEffect(() => {
        const onResize = () => setNarrow(window.innerWidth < 640)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    function addAlert(message, success = true) {
        const id = Date.now()
        setAlerts(prev => [...prev, { id, message, success }])
        setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 6000)
    }

    // Load config, then resolve which reports the current user can read.
    const refresh = useCallback(
        async cfg => {
            const groups = cfg?.groups || []
            const allCards = groups.flatMap(g => g.reports || [])
            const map = await fetchReadableReports(engine, allCards)
            setReadable(map)
        },
        [engine]
    )

    useEffect(() => {
        if (!data?.me) return
        let active = true
        setResolving(true)
        loadConfig(engine).then(async cfg => {
            if (!active) return
            const safe = cfg && cfg.groups ? cfg : { groups: [] }
            setConfig(safe)
            await refresh(safe)
            if (active) setResolving(false)
        })
        return () => {
            active = false
        }
    }, [data, engine, refresh])

    async function handleSave(newConfig) {
        await saveConfig(engine, newConfig)
        setConfig(newConfig)
        setResolving(true)
        await refresh(newConfig)
        setResolving(false)
        setShowConfig(false)
        addAlert('Configuration saved.')
    }

    if (loading || resolving || !config || !readable) {
        return (
            <div style={styles.center}>
                <CircularLoader />
            </div>
        )
    }

    if (error) {
        return (
            <div style={styles.page}>
                <NoticeBox error title="Could not load user">
                    {error.message}
                </NoticeBox>
            </div>
        )
    }

    const currentUser = data.me
    const canManage = isSuperuser(currentUser)

    // Build visible groups: keep only reports the user can read, enrich with live
    // name/description, and drop groups that end up empty.
    const visibleGroups = (config.groups || [])
        .map(group => {
            const reports = (group.reports || [])
                .filter(r => readable.has(r.uid))
                .map(r => ({ ...r, ...readable.get(r.uid) }))
            return { ...group, resolvedReports: reports }
        })
        .filter(group => group.resolvedReports.length > 0)

    return (
        <div style={styles.page}>
            <AlertStack>
                {alerts.map(a => (
                    <AlertBar
                        key={a.id}
                        success={a.success}
                        critical={!a.success}
                        onHidden={() =>
                            setAlerts(prev => prev.filter(x => x.id !== a.id))
                        }
                    >
                        {a.message}
                    </AlertBar>
                ))}
            </AlertStack>

            <header style={styles.header}>
                <div style={styles.brand}>
                    <Logo />
                    <div>
                        <div style={styles.appTitle}>Reports Navigator</div>
                        <div style={styles.appSubtitle}>
                            Find and open your saved reports
                        </div>
                    </div>
                </div>
                {canManage ? (
                    <Button
                        icon={<IconSettings24 />}
                        onClick={() => setShowConfig(true)}
                        title="Manage reports"
                    >
                        {narrow ? undefined : 'Manage reports'}
                    </Button>
                ) : null}
            </header>

            {visibleGroups.length === 0 ? (
                <NoticeBox title="No reports to show">
                    {canManage
                        ? 'No report groups are configured yet. Click "Manage reports" to add some.'
                        : 'There are no reports available to you right now. Check back later or contact your administrator.'}
                </NoticeBox>
            ) : (
                visibleGroups.map(group => (
                    <GroupSection
                        key={group.id}
                        group={group}
                        reports={group.resolvedReports}
                        baseUrl={baseUrl}
                    />
                ))
            )}

            {showConfig ? (
                <ConfigPanel
                    config={config}
                    readable={readable}
                    onSave={handleSave}
                    onClose={() => setShowConfig(false)}
                />
            ) : null}

            <footer style={styles.footer}>
                Reports Navigator · a DHIS2 application
            </footer>
        </div>
    )
}

function Logo() {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
            <rect width="36" height="36" rx="8" fill="#1565C0" />
            <rect x="9" y="9" width="7" height="7" rx="1.5" fill="#fff" />
            <rect x="20" y="9" width="7" height="7" rx="1.5" fill="#fff" />
            <rect x="9" y="20" width="7" height="7" rx="1.5" fill="#fff" />
            <rect x="20" y="20" width="7" height="7" rx="1.5" fill="#fff" />
        </svg>
    )
}

const styles = {
    page: { maxWidth: 1200, margin: '0 auto', padding: '24px 32px' },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    brand: { display: 'flex', alignItems: 'center', gap: 12 },
    appTitle: { fontSize: 22, fontWeight: 700, color: '#212934' },
    appSubtitle: { fontSize: 13, color: '#6c7787' },
    footer: {
        marginTop: 40,
        paddingTop: 16,
        borderTop: '1px solid #e0e5eb',
        textAlign: 'center',
        fontSize: 12,
        color: '#a0adba',
    },
}
