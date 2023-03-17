import { FernRegistry } from "@fern-fern/registry";
import React, { useCallback } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { useApiTab } from "../../../api-tabs/context/useApiTab";
import { useTypePath } from "../../../routes/useTypePath";
import { useApiDefinitionItemContext } from "../../context/useApiDefinitionItemContext";
import { TypeIcon } from "../TypeIcon";

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
        <div className="flex rounded overflow-hidden cursor-pointer" onClick={onClick}>
            <div className="flex items-center bg-[#5ec069] px-1">
                <TypeIcon color="white" />
            </div>
            <div className="flex items-center bg-[#deede4] px-1">{resolveTypeById(typeId).name}</div>
        </div>
    );
};
