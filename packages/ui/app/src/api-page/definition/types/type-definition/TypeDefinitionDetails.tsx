import React from "react";
import { SeparatedElements } from "../../../../commons/SeparatedElements";
import { TypeComponentSeparator } from "../TypeComponentSeparator";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        elements: JSX.Element[];
        separatorText: string | undefined;
    }
}

export const TypeDefinitionDetails: React.FC<TypeDefinitionDetails.Props> = ({ elements, separatorText }) => {
    return (
        <div className="flex flex-col">
            <TypeComponentSeparator />
            <SeparatedElements
                separator={
                    separatorText != null ? (
                        <div className="flex items-center gap-2">
                            <TypeComponentSeparator className="flex-1" />
                            <div className="text-gray-200 dark:text-gray-700">{separatorText}</div>
                            <TypeComponentSeparator className="flex-1" />
                        </div>
                    ) : (
                        <TypeComponentSeparator />
                    )
                }
            >
                {elements}
            </SeparatedElements>
        </div>
    );
};
