import { MenuItem, PopoverPosition } from "@blueprintjs/core";
import { ItemRenderer, Select2, SelectPopoverProps } from "@blueprintjs/select";
import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { useAllEnvironments } from "../../../../queries/useAllEnvironments";
import { EnvironmentSelectButton } from "./EnvironmentSelectButton";

export declare namespace EnvironmentSelect {
    export interface Props {
        selectedEnvironment: FernRegistry.Environment;
        onChange: (environment: FernRegistry.EnvironmentId) => void;
    }
}

const POPOVER_PROPS: SelectPopoverProps["popoverProps"] = {
    position: PopoverPosition.BOTTOM_RIGHT,
};

export const EnvironmentSelect: React.FC<EnvironmentSelect.Props> = ({ selectedEnvironment, onChange }) => {
    const environments = useAllEnvironments();

    const handleChange = useCallback(
        (newEnvironment: FernRegistry.Environment) => {
            onChange(newEnvironment.id);
        },
        [onChange]
    );

    if (environments.type !== "loaded") {
        return <EnvironmentSelectButton environmentName={undefined} />;
    }

    return (
        <Select2<FernRegistry.Environment>
            items={environments.value.environments}
            activeItem={selectedEnvironment}
            filterable={false}
            itemRenderer={renderFilm}
            noResults={<MenuItem disabled text="No results." roleStructure="listoption" />}
            onItemSelect={handleChange}
            popoverProps={POPOVER_PROPS}
        >
            <EnvironmentSelectButton environmentName={selectedEnvironment.name} />
        </Select2>
    );
};

const renderFilm: ItemRenderer<FernRegistry.Environment> = (item, { handleClick, handleFocus, modifiers }) => {
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={item.id}
            onClick={handleClick}
            onFocus={handleFocus}
            roleStructure="listoption"
            text={item.name}
        />
    );
};
