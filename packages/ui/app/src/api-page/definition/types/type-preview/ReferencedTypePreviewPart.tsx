import { FernRegistry } from "@fern-fern/registry";
import React, { useCallback } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { useApiTab } from "../../../api-tabs/context/useApiTab";
import { useTypePath } from "../../../routes/useTypePath";
import { useApiDefinitionItemContext } from "../../context/useApiDefinitionItemContext";

export declare namespace ReferencedTypePreviewPart {
    export interface Props {
        typeId: FernRegistry.TypeId;
    }
}

export const ReferencedTypePreviewPart: React.FC<ReferencedTypePreviewPart.Props> = ({ typeId }) => {
    const { resolveTypeById } = useApiDefinitionContext();
    const { environmentId } = useApiDefinitionItemContext();

    const path = useTypePath({ environmentId, typeId });
    const { openTab } = useApiTab(path);

    const onClick = useCallback(() => {
        openTab({ doNotCloseExistingTab: true });
    }, [openTab]);

    return (
        <span className="underline underline-offset-2 cursor-pointer" onClick={onClick}>
            {resolveTypeById(typeId).name}
        </span>
    );
};
