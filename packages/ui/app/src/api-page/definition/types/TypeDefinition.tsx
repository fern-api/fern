import { Collapse, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { Markdown } from "../markdown/Markdown";
import { EnglishTypeShapeSummary } from "./english-summary/EnglishTypeShapeSummary";
import { ObjectDefinition } from "./object/ObjectDefinition";
import { ReferencedTypePreviewPart } from "./type-preview/ReferencedTypePreviewPart";
import styles from "./TypeDefinition.module.scss";

export declare namespace TypeDefinition {
    export interface Props {
        typeId: FernRegistry.TypeId;
        defaultIsCollapsed: boolean;
    }
}

interface CollapsibleContent {
    element: JSX.Element;
    showText: string;
    hideText: string;
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({ typeId, defaultIsCollapsed }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const typeDefinition = useMemo(() => resolveTypeById(typeId), [resolveTypeById, typeId]);

    const collapsableContent = typeDefinition.shape._visit<CollapsibleContent | undefined>({
        alias: () => undefined,
        object: (object) => ({
            element: <ObjectDefinition object={object} />,
            showText: `Show ${object.properties.length} properties`,
            hideText: `Hide ${object.properties.length} properties`,
        }),
        undiscriminatedUnion: () => undefined,
        discriminatedUnion: () => undefined,
        enum: () => undefined,
        _other: () => undefined,
    });

    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(defaultIsCollapsed);

    return (
        <div className="border border-gray-200 rounded">
            <div className="flex flex-col px-2 py-1">
                <div className="flex items-center justify-between">
                    <div>
                        <ReferencedTypePreviewPart typeId={typeId} />
                        {" is "}
                        <EnglishTypeShapeSummary shape={typeDefinition.shape} />
                    </div>
                    {collapsableContent != null && (
                        <div
                            className="flex gap-1 items-center text-gray-500 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
                            onClick={toggleIsCollapsed}
                        >
                            <Icon
                                className={classNames("transition ", {
                                    "rotate-45": !isCollapsed,
                                })}
                                icon={IconNames.ADD}
                            />
                            <div
                                className={classNames(styles.showPropertiesButton, "select-none")}
                                data-show-text={collapsableContent.showText}
                            >
                                {isCollapsed ? collapsableContent.showText : collapsableContent.hideText}
                            </div>
                        </div>
                    )}
                </div>
                {typeDefinition.description != null && (
                    <div className="mt-2 text-gray-500">
                        <Markdown>{typeDefinition.description}</Markdown>
                    </div>
                )}
            </div>
            {collapsableContent != null && <Collapse isOpen={!isCollapsed}>{collapsableContent.element}</Collapse>}
        </div>
    );
};
