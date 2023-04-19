import React from "react";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        elements: JSX.Element[];
        separatorText: string | undefined;
    }
}

export const TypeDefinitionDetails: React.FC<TypeDefinitionDetails.Props> = ({ elements, separatorText }) => {
    return (
        <div className="flex flex-col">
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            {zipWith(
                elements,
                separatorText != null ? (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <div className="text-gray-200 dark:text-gray-700">{separatorText}</div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>
                ) : (
                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
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
