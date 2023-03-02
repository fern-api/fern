import { MenuItem, PopoverPosition } from "@blueprintjs/core";
import { ItemRenderer, Select2, SelectPopoverProps } from "@blueprintjs/select";
import { assertNever } from "@fern-api/core-utils";
import { useCallback, useMemo } from "react";
import { useAllEnvironments } from "../../../../queries/useAllEnvironments";
import { ParsedEnvironmentId } from "../../../routes/useCurrentEnvironment";
import { EnvironmentSelectButton } from "./EnvironmentSelectButton";

export declare namespace EnvironmentSelect {
    export interface Props {
        selectedEnvironmentId: ParsedEnvironmentId;
        onChange: (environmentId: ParsedEnvironmentId) => void;
    }
}

const POPOVER_PROPS: SelectPopoverProps["popoverProps"] = {
    position: PopoverPosition.BOTTOM_RIGHT,
};

export const EnvironmentSelect: React.FC<EnvironmentSelect.Props> = ({ selectedEnvironmentId, onChange }) => {
    const environments = useAllEnvironments();

    const allItems = useMemo(() => {
        const items: ParsedEnvironmentId[] = [{ type: "latest" }];
        if (environments.type === "loaded") {
            items.push(
                ...environments.value.environments.map(
                    (environment): ParsedEnvironmentId => ({
                        type: "environment",
                        environmentId: environment.id,
                    })
                )
            );
        }
        return items;
    }, [environments]);

    const getEnvironmentLabel = useCallback((environmentId: ParsedEnvironmentId) => {
        switch (environmentId.type) {
            case "environment":
                return environmentId.environmentId;
            case "latest":
                return "Latest";
            default:
                assertNever(environmentId);
        }
    }, []);

    const renderItem: ItemRenderer<ParsedEnvironmentId> = useCallback(
        (item, { handleClick, handleFocus, modifiers }) => {
            return (
                <MenuItem
                    active={modifiers.active}
                    disabled={modifiers.disabled}
                    key={item.type === "environment" ? item.environmentId : "latest"}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    roleStructure="listoption"
                    text={getEnvironmentLabel(item)}
                />
            );
        },
        [getEnvironmentLabel]
    );

    return (
        <Select2<ParsedEnvironmentId>
            items={allItems}
            activeItem={selectedEnvironmentId}
            filterable={false}
            itemRenderer={renderItem}
            onItemSelect={onChange}
            popoverProps={POPOVER_PROPS}
        >
            <EnvironmentSelectButton label={getEnvironmentLabel(selectedEnvironmentId)} />
        </Select2>
    );
};
