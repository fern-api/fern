import { Collapse, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState, useIsHovering } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { TypeDefinitionContext, TypeDefinitionContextValue } from "./context/TypeDefinitionContext";
import { ObjectDefinition } from "./object/ObjectDefinition";
import styles from "./TypeDefinition.module.scss";

export declare namespace TypeDefinition {
    export interface Props {
        typeId: FernRegistry.TypeId;
        isCollapsible: boolean;
    }
}

interface CollapsibleContent {
    element: JSX.Element;
    showText: string;
    hideText: string;
}

const NESTED_TYPE_DEFINITION_CONTEXT_VALUE: TypeDefinitionContextValue = {
    isRootTypeDefinition: false,
};

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({ typeId, isCollapsible }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const typeDefinition = useMemo(() => resolveTypeById(typeId), [resolveTypeById, typeId]);

    const collapsableContent = typeDefinition.shape._visit<CollapsibleContent | undefined>({
        alias: () => undefined,
        object: (object) =>
            object.properties.length > 0
                ? {
                      element: <ObjectDefinition object={object} />,
                      showText:
                          object.properties.length === 1
                              ? "Show 1 property"
                              : `Show ${object.properties.length} properties`,
                      hideText:
                          object.properties.length === 1
                              ? "Hide 1 property"
                              : `Hide ${object.properties.length} properties`,
                  }
                : undefined,
        undiscriminatedUnion: () => undefined,
        discriminatedUnion: () => undefined,
        enum: () => undefined,
        _other: () => undefined,
    });

    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(true);

    const { isHovering, ...containerCallbacks } = useIsHovering();

    const [originalButtonWidth, setOriginalButtonWidth] = useState<number>();
    const [buttonRef, setButtonRef] = useState<HTMLDivElement | null>(null);
    useEffect(() => {
        if (originalButtonWidth == null && buttonRef != null) {
            // in case we're being expanded right now, wait for animation to finish
            setTimeout(() => {
                setOriginalButtonWidth(buttonRef.getBoundingClientRect().width);
            }, 500);
        }
    }, [buttonRef, originalButtonWidth]);

    if (collapsableContent == null) {
        return null;
    }

    if (!isCollapsible) {
        return collapsableContent.element;
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-col items-start">
                <div
                    className={classNames(
                        "flex flex-col border rounded overflow-hidden mt-2",
                        "border-gray-200",
                        "dark:border-gray-700"
                    )}
                    style={{
                        width: isCollapsed ? originalButtonWidth : "100%",
                    }}
                    ref={setButtonRef}
                >
                    <div
                        {...containerCallbacks}
                        className={classNames(
                            "flex gap-1 items-center cursor-pointer px-2 py-1 transition",
                            isHovering ? "text-gray-300" : "text-gray-500"
                        )}
                        onClick={toggleIsCollapsed}
                    >
                        <Icon
                            className={classNames("transition", isHovering ? "text-gray-300" : "text-gray-500", {
                                "rotate-45": isCollapsed,
                            })}
                            icon={IconNames.CROSS}
                        />
                        <div
                            className={classNames(styles.showPropertiesButton, "select-none whitespace-nowrap")}
                            data-show-text={collapsableContent.showText}
                        >
                            {isCollapsed ? collapsableContent.showText : collapsableContent.hideText}
                        </div>
                    </div>
                    <Collapse isOpen={!isCollapsed}>
                        <TypeDefinitionContext.Provider value={NESTED_TYPE_DEFINITION_CONTEXT_VALUE}>
                            {collapsableContent.element}
                        </TypeDefinitionContext.Provider>
                    </Collapse>
                </div>
            </div>
        </div>
    );
};
