import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback, useMemo } from "react";
import { DraftTypeSidebarItemId } from "../context/SidebarContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { useAddDraft } from "../shared/useAddDraft";

export declare namespace useCreateTypeCallback {
    export interface Args {
        package_: FernApiEditor.Package;
    }
}

export function useCreateTypeCallback({ package_ }: useCreateTypeCallback.Args): () => void {
    const createDraft = useCallback((): DraftTypeSidebarItemId => {
        return {
            type: "type",
            parent: package_.packageId,
            typeId: EditorItemIdGenerator.type(),
        };
    }, [package_.packageId]);

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.types(package_), [package_]);

    const { onClickAdd } = useAddDraft({
        sidebarItemId,
        createDraft,
    });

    return onClickAdd;
}
