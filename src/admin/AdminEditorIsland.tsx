import { AdminLayout, DocumentEditor } from '@verevoir/admin';
import type { AdminGroup, AdminIdentity, DocumentEditorProps } from '@verevoir/admin';
import type { VersionRecord } from '@verevoir/editor/version-store';

/**
 * Versioning data the route loader passes through. Functions can't
 * cross the Astro `client:only` JSON boundary, so the URL endpoints
 * arrive as strings and the island wires them into action callbacks
 * client-side via fetch.
 */
export interface VersioningData {
    record: VersionRecord<Record<string, unknown>>;
    versions: VersionRecord<Record<string, unknown>>[];
    publishUrl: string;
    unpublishUrl: string;
    newVersionUrl: string;
    versionPath: string; // e.g. '/admin/page' — the island appends `/${id}`
}

export interface AdminEditorIslandProps {
    groups: AdminGroup[];
    basePath?: string;
    currentPath?: string;
    identity?: AdminIdentity;
    /**
     * Breadcrumb shown in the shell header. Pre-built on the server
     * since the entry label lives in the registry, not in the
     * serializable groups view.
     */
    breadcrumbs?: Array<{ label: string; href?: string }>;
    /** Whether the editor expects a side-by-side preview pane. */
    hasPreview?: boolean;
    /** All `DocumentEditor` props except `versioning`, forwarded as-is. */
    editor: Omit<DocumentEditorProps, 'versioning'>;
    /**
     * Optional versioning data. When present, the island builds the
     * `versioning` prop bundle for DocumentEditor — wiring fetch
     * handlers to the URL endpoints + a navigation function based on
     * versionPath.
     */
    versioningData?: VersioningData;
}

export function AdminEditorIsland({
    groups,
    basePath = '/admin',
    currentPath,
    identity,
    breadcrumbs,
    hasPreview,
    editor,
    versioningData,
}: AdminEditorIslandProps) {
    const versioning = versioningData
        ? buildVersioningProps(versioningData)
        : undefined;

    return (
        <AdminLayout
            groups={groups}
            basePath={basePath}
            currentPath={currentPath}
            shell={{
                title: <img src="/images/verevoir-wide.svg" alt="Verevoir" height={42} />,
                identity,
                breadcrumbs,
                wide: hasPreview,
            }}
        >
            <DocumentEditor {...editor} versioning={versioning} />
        </AdminLayout>
    );
}

function buildVersioningProps(data: VersioningData) {
    return {
        record: data.record,
        versions: data.versions,
        versionPath: (id: string) => `${data.versionPath}/${id}`,
        onPublish: async () => {
            await postJson(data.publishUrl, { id: data.record.id });
        },
        onUnpublish: async () => {
            await postJson(data.unpublishUrl, { id: data.record.id });
        },
        onCreateNewVersion: async (sourceId: string) => {
            const result = await postJson<{ id: string }>(data.newVersionUrl, {
                sourceId,
            });
            return result.id;
        },
        onNavigate: (path: string) => {
            window.location.href = path;
        },
    };
}

async function postJson<T = unknown>(
    url: string,
    body: Record<string, unknown>,
): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`${url}: ${res.status} ${errBody}`);
    }
    return res.json() as Promise<T>;
}
