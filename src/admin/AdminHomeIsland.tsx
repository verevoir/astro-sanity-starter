import { AdminLayout } from '@verevoir/admin';
import type { AdminGroup, AdminIdentity } from '@verevoir/admin';

export interface AdminHomeIslandProps {
    groups: AdminGroup[];
    basePath?: string;
    currentPath?: string;
    identity?: AdminIdentity;
}

/**
 * Single client island for the admin home route. Wraps the
 * `<DocumentList>` body in `<AdminLayout>` so the providers, shell,
 * and sidebar are all in one React tree — required so the sidebar
 * filter actually drives the document list.
 */
export function AdminHomeIsland({ groups, basePath = '/admin', currentPath, identity }: AdminHomeIslandProps) {
    return (
        <AdminLayout
            groups={groups}
            basePath={basePath}
            currentPath={currentPath}
            shell={{
                title: <img src="/images/verevoir-wide.svg" alt="Verevoir" height={42} />,
                identity,
                navLinks: [{ label: 'View site →', href: '/' }]
            }}
        >
            {null}
        </AdminLayout>
    );
}
