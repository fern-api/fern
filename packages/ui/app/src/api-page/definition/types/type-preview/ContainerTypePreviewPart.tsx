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
        <span>
            <span>
                {containerName}
                {"<"}
            </span>
            {itemTypes.map((type, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <>
                            ,<span className="inline-block w-1" />
                        </>
                    )}
                    <TypePreviewPart type={type} includeContainerItems={includeContainerItems} />
                </React.Fragment>
            ))}
            <span>{">"}</span>
        </span>
    );
};
