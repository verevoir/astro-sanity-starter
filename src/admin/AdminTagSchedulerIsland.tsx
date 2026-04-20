import { AdminLayout, TagScheduler } from '@verevoir/admin';
import type { AdminGroup } from '@verevoir/admin';
import type { TagDocument } from '@verevoir/admin/server';

export interface AdminTagSchedulerIslandProps {
    groups: AdminGroup[];
    basePath?: string;
    currentPath?: string;
    tag: string;
    documents: TagDocument[];
    /**
     * Whether the current identity can update any document in this
     * tag. v1 has no per-document ownership so this is a single
     * boolean rather than a predicate.
     */
    canEditAll: boolean;
    bulkPublishUrl: string;
}

export function AdminTagSchedulerIsland({
    groups,
    basePath = '/admin',
    currentPath,
    tag,
    documents,
    canEditAll,
    bulkPublishUrl,
}: AdminTagSchedulerIslandProps) {
    const handleSave = async ({
        documentIds,
        publishFrom,
        publishTo,
    }: {
        documentIds: string[];
        publishFrom: string | undefined;
        publishTo: string | undefined;
    }) => {
        const response = await fetch(bulkPublishUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ documentIds, publishFrom, publishTo }),
        });
        if (!response.ok) {
            throw new Error(`Bulk publish failed: ${response.status}`);
        }
        // Refresh the page so the updated window shows on the row list.
        // Heavy-handed for now; a finer refresh would replay loadTagDetail.
        window.location.reload();
    };

    return (
        <AdminLayout
            groups={groups}
            basePath={basePath}
            currentPath={currentPath}
            shell={{
                title: <img src="/images/verevoir-wide.svg" alt="Verevoir" height={42} />,
                breadcrumbs: [{ label: 'Tags', href: `${basePath}/tags` }, { label: tag }],
            }}
        >
            <TagScheduler
                tag={tag}
                documents={documents}
                canEdit={() => canEditAll}
                onSave={handleSave}
            />
        </AdminLayout>
    );
}
