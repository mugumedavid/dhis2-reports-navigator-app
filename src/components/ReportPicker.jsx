import React, { useState } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import {
    Button,
    InputField,
    SingleSelect,
    SingleSelectOption,
    NoticeBox,
} from '@dhis2/ui'
import { REPORT_TYPE_OPTIONS, getReportType } from '../reportTypes'
import { verifyReport, genId } from '../api'

// Inline form for adding one report card to a group. Calls onAdd(report) with a new
// card object once the UID has been verified against the API.
export default function ReportPicker({ onAdd }) {
    const engine = useDataEngine()
    const [type, setType] = useState('lineListing')
    const [uid, setUid] = useState('')
    const [verified, setVerified] = useState(null) // { id, displayName, description }
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState('')
    const [nameOverride, setNameOverride] = useState('')
    const [icon, setIcon] = useState('')

    async function handleVerify() {
        setError('')
        setVerified(null)
        setVerifying(true)
        try {
            const obj = await verifyReport(engine, type, uid.trim())
            setVerified(obj)
        } catch (e) {
            setError(
                e?.message?.includes('could not be found') || e?.details?.httpStatusCode === 404
                    ? 'No report with that UID and type, or you do not have access to it.'
                    : e.message || 'Could not verify this report.'
            )
        }
        setVerifying(false)
    }

    function handleAdd() {
        onAdd({
            id: genId(),
            type,
            uid: uid.trim(),
            displayName: verified.displayName,
            description: verified.description || '',
            nameOverride: nameOverride.trim(),
            descriptionOverride: '',
            icon: icon.trim(),
        })
        // reset for the next add
        setUid('')
        setVerified(null)
        setNameOverride('')
        setIcon('')
        setError('')
    }

    return (
        <div style={styles.box}>
            <div style={styles.row}>
                <div style={{ minWidth: 160 }}>
                    <SingleSelect
                        dense
                        selected={type}
                        onChange={({ selected }) => {
                            setType(selected)
                            setVerified(null)
                            setError('')
                        }}
                    >
                        {REPORT_TYPE_OPTIONS.map(o => (
                            <SingleSelectOption key={o.value} value={o.value} label={o.label} />
                        ))}
                    </SingleSelect>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                    <InputField
                        dense
                        placeholder={`${getReportType(type)?.label || 'Report'} UID`}
                        helpText={getReportType(type)?.uidHint}
                        value={uid}
                        onChange={({ value }) => {
                            setUid(value)
                            setVerified(null)
                        }}
                    />
                </div>
                <Button small onClick={handleVerify} loading={verifying} disabled={!uid.trim()}>
                    Verify
                </Button>
            </div>

            {error ? (
                <div style={{ marginTop: 8 }}>
                    <NoticeBox error>{error}</NoticeBox>
                </div>
            ) : null}

            {verified ? (
                <div style={styles.verified}>
                    <div style={{ marginBottom: 8 }}>
                        Found: <strong>{verified.displayName}</strong>
                    </div>
                    <div style={styles.row}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <InputField
                                dense
                                label="Display name (optional override)"
                                placeholder={verified.displayName}
                                value={nameOverride}
                                onChange={({ value }) => setNameOverride(value)}
                            />
                        </div>
                        <div style={{ width: 120 }}>
                            <InputField
                                dense
                                label="Icon (optional)"
                                placeholder="emoji"
                                value={icon}
                                onChange={({ value }) => setIcon(value)}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Button small primary onClick={handleAdd}>
                            Add to group
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

const styles = {
    box: {
        border: '1px dashed #a0adba',
        borderRadius: 6,
        padding: 12,
        marginTop: 12,
        background: '#f9fafb',
    },
    row: { display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' },
    verified: {
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid #e0e5eb',
        fontSize: 14,
    },
}
