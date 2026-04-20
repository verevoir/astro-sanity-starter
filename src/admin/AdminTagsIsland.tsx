import { AdminLayout, TagList } from '@verevoir/admin';
import type { AdminGroup } from '@verevoir/admin';
import type { TagSummary } from '@verevoir/admin/server';

export interface AdminTagsIslandProps {
    groups: AdminGroup[];
    basePath?: string;
    currentPath?: string;
    tags: TagSummary[];
}

export function AdminTagsIsland({ groups, basePath = '/admin', currentPath, tags }: AdminTagsIslandProps) {
    return (
        <AdminLayout
            groups={groups}
            basePath={basePath}
            currentPath={currentPath}
            shell={{
                title: <img src="/images/verevoir-wide.svg" alt="Verevoir" height={42} />,
                breadcrumbs: [{ label: 'Tags' }],
            }}
        >
            <TagList tags={tags} basePath={`${basePath}/tags`} />
        </AdminLayout>
    );
}
