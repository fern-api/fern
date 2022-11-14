import { Icon, MenuItem } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ItemRenderer, Select2, SelectPopoverProps } from "@blueprintjs/select";
import { assertNever, keys, Values } from "@fern-api/core-utils";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import classNames from "classnames";
import React, { useCallback, useMemo, useState } from "react";
import { useApiEditorContext } from "../../../../../api-editor-context/ApiEditorContext";
import styles from "./TypeShapeChooser.module.scss";

export const TypeShape = {
    ALIAS: "alias",
    OBJECT: "object",
    UNION: "union",
    ENUM: "enum",
} as const;
export type TypeShape = Values<typeof TypeShape>;

export declare namespace TypeShapeChooser {
    export interface Props {
        type: FernApiEditor.Type;
    }
}

export const TypeShapeChooser: React.FC<TypeShapeChooser.Props> = ({ type }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const popoverProps = useMemo(
        (): SelectPopoverProps["popoverProps"] => ({
            isOpen: isPopoverOpen,
            onInteraction: setIsPopoverOpen,
            minimal: true,
        }),
        [isPopoverOpen]
    );

    const onKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
            setIsPopoverOpen(false);
        }
    }, []);

    const typeShape = useMemo(
        () =>
            type.shape._visit<TypeShape>({
                alias: () => TypeShape.ALIAS,
                enum: () => TypeShape.ENUM,
                object: () => TypeShape.OBJECT,
                union: () => TypeShape.UNION,
                _other: ({ type }) => {
                    throw new Error("Unknown shape type: " + type);
                },
            }),
        [type.shape]
    );

    const [activeItem, setActiveItem] = useState<TypeShape | null>(typeShape);

    const { submitTransaction } = useApiEditorContext();
    const setTypeShape = useCallback(
        (newShape: TypeShape) => {
            setIsPopoverOpen(false);
            submitTransaction(
                TransactionGenerator.setTypeShape({
                    typeId: type.typeId,
                    shape: getDefaultShape(newShape),
                })
            );
        },
        [submitTransaction, type.typeId]
    );

    return (
        <Select2
            items={ITEMS}
            onItemSelect={setTypeShape}
            itemRenderer={renderShapeOption}
            filterable={false}
            popoverProps={popoverProps}
            activeItem={activeItem}
            onActiveItemChange={setActiveItem}
        >
            <div
                className={classNames(styles.container, {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.focused!]: isPopoverOpen,
                })}
                tabIndex={0}
                onKeyDown={onKeyDown}
            >
                <div>{getLabelForTypeShape(typeShape)}</div>
                <Icon className={styles.icon} icon={IconNames.CARET_DOWN} />
            </div>
        </Select2>
    );
};

const ITEMS_MAP: Record<TypeShape, true> = {
    [TypeShape.OBJECT]: true,
    [TypeShape.UNION]: true,
    [TypeShape.ENUM]: true,
    [TypeShape.ALIAS]: true,
};
const ITEMS = keys(ITEMS_MAP);

const renderShapeOption: ItemRenderer<TypeShape> = (typeShape, { handleClick, handleFocus, modifiers }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={typeShape}
            onClick={handleClick}
            onFocus={handleFocus}
            text={getLabelForTypeShape(typeShape)}
        />
    );
};

function getLabelForTypeShape(shape: TypeShape): string {
    switch (shape) {
        case TypeShape.ALIAS:
            return "Alias";
        case TypeShape.OBJECT:
            return "Object";
        case TypeShape.UNION:
            return "Discriminated union";
        case TypeShape.ENUM:
            return "Enum";
        default:
            assertNever(shape);
    }
}

function getDefaultShape(shape: TypeShape): FernApiEditor.Shape {
    switch (shape) {
        case TypeShape.ALIAS:
            return FernApiEditor.Shape.alias({
                aliasOf: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
            });
        case TypeShape.OBJECT:
            return FernApiEditor.Shape.object({
                properties: [],
                extensions: [],
            });
        case TypeShape.UNION:
            return FernApiEditor.Shape.union({ discriminant: "type", members: [] });
        case TypeShape.ENUM:
            return FernApiEditor.Shape.enum({});
        default:
            assertNever(shape);
    }
}
