import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import React, { useCallback } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { useApiTab } from "../../../api-tabs/context/useApiTab";
import { useTypePath } from "../../../routes/useTypePath";
import { useApiDefinitionItemContext } from "../../context/useApiDefinitionItemContext";
import { TypeString } from "./TypeString";

export declare namespace ReferencedTypePreviewPart {
    export interface Props {
        typeId: FernRegistry.TypeId;
        className?: string;
    }
}

export const ReferencedTypePreviewPart: React.FC<ReferencedTypePreviewPart.Props> = ({ typeId, className }) => {
    const { resolveTypeById } = useApiDefinitionContext();
    const { environmentId } = useApiDefinitionItemContext();

    const path = useTypePath({ environmentId, typeId });
    const { openTab } = useApiTab(path);

    const onClick = useCallback(() => {
        openTab({ doNotCloseExistingTab: true });
    }, [openTab]);

    return (
        <div
            className={classNames(
                className,
                "flex items-center rounded overflow-hidden cursor-pointer leading-none bg-[#deede4] p-1"
            )}
            onClick={onClick}
        >
            <TypeString className="text-green-700">{resolveTypeById(typeId).name}</TypeString>
        </div>
    );
};
