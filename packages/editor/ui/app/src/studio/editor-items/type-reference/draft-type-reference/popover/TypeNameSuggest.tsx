import { MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Suggest2 } from "@blueprintjs/select";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useMemo } from "react";
import { useApiEditorContext } from "../../../../../api-editor-context/ApiEditorContext";
import { TYPE_NAME_PLACEHOLDER } from "../../../types/type/placeholder";
import styles from "./TypeNameSuggest.module.scss";

export declare namespace TypeNameSuggest {
    export interface Props {
        selectedTypeId: FernApiEditor.TypeId | undefined;
        onSelect: (type: FernApiEditor.Type) => void;
    }
}

export const TypeNameSuggest: React.FC<TypeNameSuggest.Props> = ({ selectedTypeId, onSelect }) => {
    const { definition } = useApiEditorContext();

    const allTypes = useMemo(() => Object.values(definition.types), [definition.types]);
    const selectedType = selectedTypeId != null ? definition.types[selectedTypeId] : undefined;

    return (
        <Suggest2
            items={allTypes}
            selectedItem={selectedType ?? null}
            onItemSelect={onSelect}
            itemRenderer={renderType}
            inputValueRenderer={getTypeName}
        />
    );
};

export const renderType: ItemRenderer<FernApiEditor.Type> = (type, { handleClick, handleFocus, modifiers }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            key={type.typeId}
            active={modifiers.active}
            disabled={modifiers.disabled}
            text={
                type.typeName.length > 0 ? (
                    type.typeName
                ) : (
                    <span className={styles.untitled}>{TYPE_NAME_PLACEHOLDER}</span>
                )
            }
            onClick={handleClick}
            onFocus={handleFocus}
        />
    );
};

function getTypeName(type: FernApiEditor.Type): string {
    return type.typeName.length > 0 ? type.typeName : TYPE_NAME_PLACEHOLDER;
}
