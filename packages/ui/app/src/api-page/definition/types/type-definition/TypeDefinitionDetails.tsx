import React from "react";
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
            {zipWith(
                elements,
                separatorText != null ? (
                    <div className="flex items-center gap-2">
                        <TypeComponentSeparator className="flex-1" />
                        <div className="text-gray-200 dark:text-gray-700">{separatorText}</div>
                        <TypeComponentSeparator className="flex-1" />
                    </div>
                ) : (
                    <TypeComponentSeparator />
                )
            )}
        </div>
    );
};

function zipWith(items: JSX.Element[], separator: JSX.Element): JSX.Element[] {
    const newItems: JSX.Element[] = [];
    for (const [index, item] of items.entries()) {
        if (index > 0) {
            newItems.push(<React.Fragment key={`separator-${index}`}>{separator}</React.Fragment>);
        }
        newItems.push(item);
    }
    return newItems;
}
