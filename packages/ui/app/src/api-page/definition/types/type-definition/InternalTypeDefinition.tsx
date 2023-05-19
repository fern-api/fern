import { Collapse, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState, useIsHovering } from "@fern-api/react-commons";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { getAllObjectProperties } from "../../utils/getAllObjectProperties";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { DiscriminatedUnionVariant } from "../discriminated-union/DiscriminatedUnionVariant";
import { EnumValue } from "../enum/EnumValue";
import { ObjectProperty } from "../object/ObjectProperty";
import styles from "./InternalTypeDefinition.module.scss";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";

export declare namespace InternalTypeDefinition {
    export interface Props {
        typeShape: FernRegistryApiRead.TypeShape;
        isCollapsible: boolean;
    }
}

interface CollapsibleContent {
    elements: JSX.Element[];
    elementNameSingular: string;
    elementNamePlural: string;
    separatorText?: string;
}

export const InternalTypeDefinition: React.FC<InternalTypeDefinition.Props> = ({ typeShape, isCollapsible }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const collapsableContent = useMemo(
        () =>
            typeShape._visit<CollapsibleContent | undefined>({
                alias: () => undefined,
                object: (object) => ({
                    elements: getAllObjectProperties(object, resolveTypeById).map((property) => (
                        <ObjectProperty key={property.key} property={property} />
                    )),
                    elementNameSingular: "property",
                    elementNamePlural: "properties",
                }),
                undiscriminatedUnion: () => undefined,
                discriminatedUnion: (union) => ({
                    elements: union.variants.map((variant) => (
                        <DiscriminatedUnionVariant
                            key={variant.discriminantValue}
                            discriminant={union.discriminant}
                            unionVariant={variant}
                        />
                    )),
                    elementNameSingular: "variant",
                    elementNamePlural: "variants",
                    separatorText: "OR",
                }),
                enum: (enum_) => ({
                    elements: enum_.values.map((enumValue) => (
                        <EnumValue key={enumValue.value} enumValue={enumValue} />
                    )),
                    elementNameSingular: "possible value",
                    elementNamePlural: "possible values",
                }),
                _other: () => undefined,
            }),
        [resolveTypeById, typeShape]
    );

    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(true);

    const { isHovering, ...containerCallbacks } = useIsHovering();

    // we need to set a pixel width for the button for the transition to work
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

    const contextValue = useTypeDefinitionContext();
    const collapsibleContentContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            isRootTypeDefinition: false,
        }),
        [contextValue]
    );

    if (collapsableContent == null) {
        return null;
    }

    if (!isCollapsible) {
        return (
            <TypeDefinitionDetails
                elements={collapsableContent.elements}
                separatorText={collapsableContent.separatorText}
            />
        );
    }

    const showText =
        collapsableContent.elements.length === 1
            ? `Show ${collapsableContent.elementNameSingular}`
            : `Show ${collapsableContent.elements.length} ${collapsableContent.elementNamePlural}`;
    const hideText =
        collapsableContent.elements.length === 1
            ? `Hide ${collapsableContent.elementNameSingular}`
            : `Hide ${collapsableContent.elements.length} ${collapsableContent.elementNamePlural}`;

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
                            data-show-text={showText}
                        >
                            {isCollapsed ? showText : hideText}
                        </div>
                    </div>
                    <Collapse isOpen={!isCollapsed}>
                        <TypeDefinitionContext.Provider value={collapsibleContentContextValue}>
                            <TypeDefinitionDetails
                                elements={collapsableContent.elements}
                                separatorText={collapsableContent.separatorText}
                            />
                        </TypeDefinitionContext.Provider>
                    </Collapse>
                </div>
            </div>
        </div>
    );
};
