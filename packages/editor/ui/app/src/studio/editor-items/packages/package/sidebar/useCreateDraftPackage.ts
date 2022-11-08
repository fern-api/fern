import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { DraftPackageSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";

export declare namespace useCreateDraftPackage {
    export interface Args {
        parent: FernApiEditor.PackageId | undefined;
    }
}

export function useCreateDraftPackage({ parent }: useCreateDraftPackage.Args): () => DraftPackageSidebarItemId {
    return useCallback((): DraftPackageSidebarItemId => {
        return {
            type: "package",
            parent,
            packageId: EditorItemIdGenerator.package(),
        };
    }, [parent]);
}
