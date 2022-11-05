import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback, useMemo } from "react";
import { DraftEndpointSidebarItemId } from "../context/SidebarContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { useAddDraft } from "../shared/useAddDraft";

export declare namespace useCreateEndpointCallback {
    export interface Args {
        package_: FernApiEditor.Package;
    }
}

export function useCreateEndpointCallback({ package_ }: useCreateEndpointCallback.Args): () => void {
    const createDraft = useCallback((): DraftEndpointSidebarItemId => {
        return {
            type: "endpoint",
            parent: package_.packageId,
            endpointId: EditorItemIdGenerator.endpoint(),
        };
    }, [package_.packageId]);

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.package(package_), [package_]);

    const { onClickAdd } = useAddDraft({
        sidebarItemId,
        createDraft,
    });

    return onClickAdd;
}
