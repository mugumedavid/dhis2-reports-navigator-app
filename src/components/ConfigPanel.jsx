import React, { useState } from 'react'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    ButtonStrip,
    Button,
    InputField,
    IconAdd16,
    IconDelete16,
    IconChevronUp16,
    IconChevronDown16,
    IconChevronRight16,
    NoticeBox,
} from '@dhis2/ui'
import ReportPicker from './ReportPicker'
import { getReportType } from '../reportTypes'
import { genId } from '../api'

// deep-clone the groups array so edits don't mutate the live config until Save.
function clone(groups) {
    return JSON.parse(JSON.stringify(groups || []))
}

function move(arr, index, delta) {
    const next = [...arr]
    const target = index + delta
    if (target < 0 || target >= next.length) return next
    ;[next[index], next[target]] = [next[target], next[index]]
    return next
}

// Full-screen editor for the group/report configuration. Superuser only.
// `readable` is a Map<uid, {displayName, description}> used to show the live
// report name for already-added reports (their stored displayName may be blank).
export default function ConfigPanel({ config, readable, onSave, onClose }) {
    const [groups, setGroups] = useState(clone(config?.groups))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [collapsed, setCollapsed] = useState({}) // { [groupId]: true }

    function toggleCollapse(id) {
        setCollapsed(c => ({ ...c, [id]: !c[id] }))
    }

    function updateGroup(gi, patch) {
        setGroups(gs => gs.map((g, i) => (i === gi ? { ...g, ...patch } : g)))
    }

    function addGroup() {
        setGroups(gs => [
            ...gs,
            { id: genId(), name: 'New group', description: '', icon: '', reports: [] },
        ])
    }

    function deleteGroup(gi) {
        setGroups(gs => gs.filter((_, i) => i !== gi))
    }

    function moveGroup(gi, delta) {
        setGroups(gs => move(gs, gi, delta))
    }

    function addReport(gi, report) {
        setGroups(gs =>
            gs.map((g, i) =>
                i === gi ? { ...g, reports: [...(g.reports || []), report] } : g
            )
        )
    }

    function deleteReport(gi, ri) {
        setGroups(gs =>
            gs.map((g, i) =>
                i === gi
                    ? { ...g, reports: g.reports.filter((_, j) => j !== ri) }
                    : g
            )
        )
    }

    function moveReport(gi, ri, delta) {
        setGroups(gs =>
            gs.map((g, i) =>
                i === gi ? { ...g, reports: move(g.reports, ri, delta) } : g
            )
        )
    }

    // Best available name for a stored report row.
    function reportName(r) {
        return (
            r.nameOverride ||
            readable?.get(r.uid)?.displayName ||
            r.displayName ||
            r.uid
        )
    }

    async function handleSave() {
        setError('')
        setSaving(true)
        try {
            await onSave({ groups })
        } catch (e) {
            setError(e.message || 'Could not save configuration.')
            setSaving(false)
            return
        }
        setSaving(false)
    }

    return (
        <Modal large onClose={onClose}>
            <ModalTitle>Manage report groups</ModalTitle>
            <ModalContent>
                {error ? (
                    <div style={{ marginBottom: 12 }}>
                        <NoticeBox error>{error}</NoticeBox>
                    </div>
                ) : null}

                {groups.length === 0 ? (
                    <NoticeBox title="No groups yet">
                        Add a group, then add report cards to it.
                    </NoticeBox>
                ) : null}

                {groups.map((group, gi) => (
                    <div key={group.id} style={styles.group}>
                        <div style={styles.groupHeaderRow}>
                            <Button
                                small
                                icon={collapsed[group.id] ? <IconChevronRight16 /> : <IconChevronDown16 />}
                                onClick={() => toggleCollapse(group.id)}
                                title={collapsed[group.id] ? 'Expand' : 'Collapse'}
                            />
                            <div style={{ width: 64 }}>
                                <InputField
                                    dense
                                    label="Icon"
                                    placeholder="emoji"
                                    value={group.icon || ''}
                                    onChange={({ value }) => updateGroup(gi, { icon: value })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <InputField
                                    dense
                                    label="Group name"
                                    value={group.name || ''}
                                    onChange={({ value }) => updateGroup(gi, { name: value })}
                                />
                            </div>
                            <span style={styles.headerCount}>{(group.reports || []).length}</span>
                            <Button small icon={<IconChevronUp16 />} onClick={() => moveGroup(gi, -1)} disabled={gi === 0} title="Move up" />
                            <Button small icon={<IconChevronDown16 />} onClick={() => moveGroup(gi, 1)} disabled={gi === groups.length - 1} title="Move down" />
                            <Button small destructive icon={<IconDelete16 />} onClick={() => deleteGroup(gi)} title="Delete group" />
                        </div>

                        {collapsed[group.id] ? null : (
                            <>
                                <div style={{ marginTop: 8 }}>
                                    <InputField
                                        dense
                                        label="Description (optional)"
                                        value={group.description || ''}
                                        onChange={({ value }) => updateGroup(gi, { description: value })}
                                    />
                                </div>

                                <div style={styles.reportList}>
                                    {(group.reports || []).length === 0 ? (
                                        <div style={styles.emptyReports}>No reports in this group yet.</div>
                                    ) : (
                                        group.reports.map((r, ri) => {
                                            const def = getReportType(r.type)
                                            return (
                                                <div key={r.id} style={styles.reportRow}>
                                                    <span style={styles.reportIcon}>{r.icon || ''}</span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={styles.reportName}>{reportName(r)}</div>
                                                        <div style={styles.reportMeta}>
                                                            {def?.label || r.type} · {r.uid}
                                                        </div>
                                                    </div>
                                                    <Button small icon={<IconChevronUp16 />} onClick={() => moveReport(gi, ri, -1)} disabled={ri === 0} title="Move up" />
                                                    <Button small icon={<IconChevronDown16 />} onClick={() => moveReport(gi, ri, 1)} disabled={ri === group.reports.length - 1} title="Move down" />
                                                    <Button small destructive icon={<IconDelete16 />} onClick={() => deleteReport(gi, ri)} title="Remove report" />
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                <ReportPicker onAdd={report => addReport(gi, report)} />
                            </>
                        )}
                    </div>
                ))}

                <div style={{ marginTop: 16 }}>
                    <Button icon={<IconAdd16 />} onClick={addGroup}>
                        Add group
                    </Button>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button primary onClick={handleSave} loading={saving}>
                        Save
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

const styles = {
    group: {
        border: '1px solid #d0d5dd',
        borderRadius: 10,
        padding: 16,
        marginBottom: 18,
        background: '#f4f5f7',
    },
    groupHeaderRow: { display: 'flex', gap: 16, alignItems: 'flex-end' },
    headerCount: {
        fontSize: 12,
        fontWeight: 600,
        color: '#667085',
        background: '#e4e7ec',
        borderRadius: 20,
        padding: '3px 10px',
        marginBottom: 4,
        whiteSpace: 'nowrap',
    },
    reportList: { marginTop: 12 },
    emptyReports: { fontSize: 13, color: '#6c7787', fontStyle: 'italic', padding: '4px 0' },
    reportRow: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '8px 0',
        borderTop: '1px solid #e4e7ec',
    },
    reportIcon: { fontSize: 18, lineHeight: 1, width: 22, textAlign: 'center', flexShrink: 0 },
    reportName: { fontSize: 14, fontWeight: 500, color: '#212934', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    reportMeta: { fontSize: 12, color: '#6c7787' },
}
