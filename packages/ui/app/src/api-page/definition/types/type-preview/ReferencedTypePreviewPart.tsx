import { FernRegistry } from "@fern-fern/registry";
import React, { useCallback } from "react";
import { useTypePath } from "../../../../routes/definition/useTypePath";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { useApiTabsContext } from "../../../api-tabs/context/useApiTabsContext";
import { useApiDefinitionItemContext } from "../../context/useApiDefinitionItemContext";

export declare namespace ReferencedTypePreviewPart {
    export interface Props {
        typeId: FernRegistry.TypeId;
    }
}

export const ReferencedTypePreviewPart: React.FC<ReferencedTypePreviewPart.Props> = ({ typeId }) => {
    const { resolveTypeById } = useApiDefinitionContext();
    const { openTab } = useApiTabsContext();
    const { environmentId } = useApiDefinitionItemContext();

    const path = useTypePath({ environmentId, typeId });

    const onClick = useCallback(() => {
        openTab(path, { doNotCloseExistingTab: true });
    }, [openTab, path]);

    return (
        <span className="underline underline-offset-2 cursor-pointer" onClick={onClick}>
            {resolveTypeById(typeId).name}
        </span>
    );
};
