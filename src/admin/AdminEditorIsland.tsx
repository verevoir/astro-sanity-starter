import { AdminLayout, DocumentEditor } from '@verevoir/admin';
import type { AdminGroup, AdminIdentity, DocumentEditorProps } from '@verevoir/admin';

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
    /** All `DocumentEditor` props, forwarded as-is. */
    editor: DocumentEditorProps;
}

export function AdminEditorIsland({ groups, basePath = '/admin', currentPath, identity, breadcrumbs, hasPreview, editor }: AdminEditorIslandProps) {
    return (
        <AdminLayout
            groups={groups}
            basePath={basePath}
            currentPath={currentPath}
            shell={{
                title: <img src="/images/verevoir-wide.svg" alt="Verevoir" height={42} />,
                identity,
                breadcrumbs,
                wide: hasPreview
            }}
        >
            <DocumentEditor {...editor} />
        </AdminLayout>
    );
}
