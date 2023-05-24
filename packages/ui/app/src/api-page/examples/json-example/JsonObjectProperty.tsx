import { assertNever } from "@fern-api/core-utils";
import classNames from "classnames";
import { useContext, useEffect, useMemo, useRef } from "react";
import { JsonExampleBreadcrumb } from "./contexts/JsonExampleBreadcrumb";
import {
    JsonExampleBreadcumbsContext,
    JsonExampleBreadcumbsContextValue,
} from "./contexts/JsonExampleBreadcumbsContext";
import { useJsonExampleContext } from "./contexts/JsonExampleContext";
import { JsonPropertyPath } from "./contexts/JsonPropertyPath";
import { JsonExampleLine } from "./JsonExampleLine";
import { JsonItemBottomLine } from "./JsonItemBottomLine";
import { JsonItemMiddleLines } from "./JsonItemMiddleLines";
import { JsonItemTopLineContent } from "./JsonItemTopLineContent";

export interface JsonObjectProperty {
    object: object;
    propertyKey: string;
    propertyValue: unknown;
    isLastProperty: boolean;
}

export const JsonObjectProperty: React.FC<JsonObjectProperty> = ({
    object,
    propertyKey,
    propertyValue,
    isLastProperty,
}) => {
    const { breadcrumbs } = useContext(JsonExampleBreadcumbsContext);
    const contextValue = useMemo(
        (): JsonExampleBreadcumbsContextValue => ({
            breadcrumbs: [
                ...breadcrumbs,
                {
                    type: "objectProperty",
                    object,
                    propertyName: propertyKey,
                },
            ],
        }),
        [breadcrumbs, object, propertyKey]
    );

    const { selectedProperty } = useJsonExampleContext();
    const isSelected = useMemo(() => {
        if (selectedProperty == null) {
            return false;
        }
        return doBreadcrumbsMatchJsonPath({
            breadcrumbs: contextValue.breadcrumbs,
            jsonPropertyPath: selectedProperty,
        });
    }, [contextValue.breadcrumbs, selectedProperty]);

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isSelected) {
            ref.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [isSelected]);

    return (
        <div className="relative" ref={ref}>
            <JsonExampleLine>
                <div>
                    <span>
                        <span className="text-[#a5acb8]">&quot;{propertyKey}&quot;</span>
                        <span>:</span>
                    </span>
                    &nbsp;
                    <JsonItemTopLineContent value={propertyValue} isNonLastItemInCollection={!isLastProperty} />
                </div>
            </JsonExampleLine>
            <JsonExampleBreadcumbsContext.Provider value={contextValue}>
                <JsonItemMiddleLines value={propertyValue} />
            </JsonExampleBreadcumbsContext.Provider>
            <JsonItemBottomLine value={propertyValue} isNonLastItemInCollection={!isLastProperty} />
            <div
                className={classNames(
                    "absolute inset-x-1 inset-y-0 border rounded transition",
                    isSelected ? "bg-[#716FEC]/20 border-[#716FEC]" : "bg-transparent border-transparent"
                )}
            />
        </div>
    );
};

function doBreadcrumbsMatchJsonPath({
    breadcrumbs,
    jsonPropertyPath,
}: {
    breadcrumbs: JsonExampleBreadcrumb[];
    jsonPropertyPath: JsonPropertyPath;
}): boolean {
    const [firstJsonPropertyPathPart, ...remainingJsonPropertyPathParts] = jsonPropertyPath;
    const [firstBreadcrumb, ...remainingBreadcrumbs] = breadcrumbs;

    if (firstJsonPropertyPathPart == null) {
        return firstBreadcrumb == null;
    }
    if (firstBreadcrumb == null) {
        return false;
    }

    switch (firstJsonPropertyPathPart.type) {
        case "objectFilter": {
            if (firstBreadcrumb.type !== "objectProperty") {
                return false;
            }
            if (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (firstBreadcrumb.object as any)[firstJsonPropertyPathPart.propertyName] !==
                firstJsonPropertyPathPart.requiredValue
            ) {
                return false;
            }
            return doBreadcrumbsMatchJsonPath({
                breadcrumbs,
                jsonPropertyPath: remainingJsonPropertyPathParts,
            });
        }

        case "objectProperty": {
            if (firstBreadcrumb.type !== "objectProperty") {
                return false;
            }

            if (
                firstJsonPropertyPathPart.propertyName != null &&
                firstJsonPropertyPathPart.propertyName !== firstBreadcrumb.propertyName
            ) {
                return false;
            }

            return doBreadcrumbsMatchJsonPath({
                breadcrumbs: remainingBreadcrumbs,
                jsonPropertyPath: remainingJsonPropertyPathParts,
            });
        }

        case "listItem":
            if (firstBreadcrumb.type !== "listItem") {
                return false;
            }

            if (firstJsonPropertyPathPart.index != null && firstJsonPropertyPathPart.index !== firstBreadcrumb.index) {
                return false;
            }

            return doBreadcrumbsMatchJsonPath({
                breadcrumbs: remainingBreadcrumbs,
                jsonPropertyPath: remainingJsonPropertyPathParts,
            });

        default:
            assertNever(firstJsonPropertyPathPart);
    }
}
