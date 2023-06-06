import { assertNever } from "@fern-api/core-utils";
import { useContext, useEffect, useMemo, useRef } from "react";
import { JsonExampleBreadcrumb } from "./contexts/JsonExampleBreadcrumb";
import {
    JsonExampleBreadcumbsContext,
    JsonExampleBreadcumbsContextValue,
} from "./contexts/JsonExampleBreadcumbsContext";
import { useJsonExampleContext } from "./contexts/JsonExampleContext";
import { JsonPropertyPath } from "./contexts/JsonPropertyPath";
import {
    JsonPropertySelectionContext,
    JsonPropertySelectionContextValue,
} from "./contexts/JsonPropertySelectionContext";
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
    const { containerRef } = useJsonExampleContext();

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

    const topLineRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (containerRef == null || topLineRef.current == null) {
            return;
        }
        if (isSelected) {
            const targetBBox = topLineRef.current.getBoundingClientRect();
            const containerBBox = containerRef.getBoundingClientRect();
            containerRef.scrollTo({
                top: containerRef.scrollTop + targetBBox.y - containerBBox.y - 20,
                left: 0,
                behavior: "smooth",
            });
        }
    }, [containerRef, isSelected]);

    const { isSelected: isAncestorSelected } = useContext(JsonPropertySelectionContext);
    const propertySelectionContextValue = useMemo(
        (): JsonPropertySelectionContextValue => ({ isSelected: isSelected || isAncestorSelected }),
        [isAncestorSelected, isSelected]
    );

    return (
        <JsonPropertySelectionContext.Provider value={propertySelectionContextValue}>
            <JsonExampleLine ref={topLineRef}>
                <span className="text-neutral-300">&quot;{propertyKey}&quot;</span>
                {": "}
                <JsonItemTopLineContent value={propertyValue} isNonLastItemInCollection={!isLastProperty} />
            </JsonExampleLine>
            <JsonExampleBreadcumbsContext.Provider value={contextValue}>
                <JsonItemMiddleLines value={propertyValue} />
            </JsonExampleBreadcumbsContext.Provider>
            <JsonItemBottomLine value={propertyValue} isNonLastItemInCollection={!isLastProperty} />
        </JsonPropertySelectionContext.Provider>
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
