import { REPORT_TYPES, getReportType } from './reportTypes'

const DATASTORE_NS = 'reports-navigator-app'
const DATASTORE_KEY = 'config'

export const currentUserQuery = {
    me: {
        resource: 'me',
        params: { fields: 'id,username,displayName,authorities' },
    },
}

export function isSuperuser(currentUser) {
    const auth = new Set(currentUser?.authorities || [])
    return auth.has('ALL') || auth.has('F_SYSTEM_SETTING')
}

// Short, DataStore-friendly unique id for groups/reports.
export function genId() {
    return (
        Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    )
}

export async function loadConfig(engine) {
    try {
        const result = await engine.query({
            config: { resource: `dataStore/${DATASTORE_NS}/${DATASTORE_KEY}` },
        })
        return result.config
    } catch {
        return { groups: [] }
    }
}

export async function saveConfig(engine, config) {
    // Try PUT first (update); fall back to POST (create) when the key doesn't exist yet.
    try {
        await engine.mutate({
            type: 'update',
            resource: `dataStore/${DATASTORE_NS}/${DATASTORE_KEY}`,
            data: config,
        })
    } catch {
        await engine.mutate({
            type: 'create',
            resource: `dataStore/${DATASTORE_NS}/${DATASTORE_KEY}`,
            data: config,
        })
    }
}

// Given all configured report cards, return a Map keyed by UID of the reports the
// current user can actually READ, enriched with their live displayName/description.
//
// A DHIS2 metadata list query returns only objects the user has read access to, so the
// returned set IS the visible set. We issue one query per distinct resource (type).
export async function fetchReadableReports(engine, cards) {
    // Group UIDs by resource, remembering which types map to each resource.
    const uidsByResource = {}
    for (const card of cards) {
        const def = getReportType(card.type)
        if (!def || !card.uid) continue
        if (!uidsByResource[def.resource]) uidsByResource[def.resource] = new Set()
        uidsByResource[def.resource].add(card.uid)
    }

    const readable = new Map()

    // Chunk the id:in filter so the request URL stays well within server limits
    // even when a group references hundreds of reports.
    const CHUNK = 80
    const tasks = []
    for (const [resource, uidSet] of Object.entries(uidsByResource)) {
        const uids = [...uidSet]
        for (let i = 0; i < uids.length; i += CHUNK) {
            const batch = uids.slice(i, i + CHUNK)
            tasks.push(
                (async () => {
                    try {
                        const result = await engine.query({
                            objects: {
                                resource,
                                params: {
                                    filter: `id:in:[${batch.join(',')}]`,
                                    fields: 'id,displayName,description',
                                    paging: false,
                                },
                            },
                        })
                        // The list property is named after the resource (e.g. eventVisualizations).
                        const list =
                            result.objects[resource] ||
                            result.objects.objects ||
                            []
                        for (const obj of list) {
                            readable.set(obj.id, {
                                displayName: obj.displayName,
                                description: obj.description || '',
                            })
                        }
                    } catch {
                        // On query failure, leave this batch out — they simply won't be shown.
                    }
                })()
            )
        }
    }

    await Promise.all(tasks)
    return readable
}

// Fetch a single object to confirm it exists and return its live name — used by the
// admin's "Verify" button when adding a report card.
export async function verifyReport(engine, type, uid) {
    const def = getReportType(type)
    if (!def) throw new Error('Unknown report type.')
    if (!/^[a-zA-Z][a-zA-Z0-9]{10}$/.test(uid)) {
        throw new Error('UID must be an 11-character code starting with a letter.')
    }
    const result = await engine.query({
        object: {
            resource: `${def.resource}/${uid}`,
            params: { fields: 'id,displayName,description' },
        },
    })
    return result.object
}

export { REPORT_TYPES }
