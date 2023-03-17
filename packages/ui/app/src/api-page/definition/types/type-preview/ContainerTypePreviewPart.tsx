import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { TypePreviewPart } from "./TypePreviewPart";

export declare namespace ContainerTypePreviewPart {
    export interface Props {
        containerName: string;
        itemTypes: FernRegistry.Type[];
        includeContainerItems: boolean;
    }
}

export const ContainerTypePreviewPart: React.FC<ContainerTypePreviewPart.Props> = ({
    containerName,
    itemTypes,
    includeContainerItems,
}) => {
    if (!includeContainerItems) {
        return <span>{containerName}</span>;
    }

    return (
        <div className="flex">
            <div>
                {containerName}
                {"<"}
            </div>
            {itemTypes.map((type, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <>
                            ,<div className="w-1" />
                        </>
                    )}
                    <div className="mx-1">
                        <TypePreviewPart type={type} includeContainerItems={includeContainerItems} />
                    </div>
                </React.Fragment>
            ))}
            <div>{">"}</div>
        </div>
    );
};
