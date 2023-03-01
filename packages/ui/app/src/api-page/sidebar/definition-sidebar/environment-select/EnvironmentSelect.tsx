import { Classes, MenuItem, PopoverPosition } from "@blueprintjs/core";
import { ItemRenderer, Select2, SelectPopoverProps } from "@blueprintjs/select";
import { assertNever } from "@fern-api/core-utils";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
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

    const getEnvironmentById = useCallback(
        (environmentId: FernRegistry.EnvironmentId): FernRegistry.Environment | undefined => {
            if (environments.type !== "loaded") {
                return undefined;
            }
            return environments.value.environments.find((e) => e.id === environmentId);
        },
        [environments]
    );

    const getEnvironmentLabel = useCallback(
        (environmentId: ParsedEnvironmentId) => {
            switch (environmentId.type) {
                case "environment":
                    return getEnvironmentById(environmentId.environmentId)?.name;
                case "latest":
                    return "Latest";
                default:
                    assertNever(environmentId);
            }
        },
        [getEnvironmentById]
    );

    const renderItem: ItemRenderer<ParsedEnvironmentId> = useCallback(
        (item, { handleClick, handleFocus, modifiers }) => {
            const label = getEnvironmentLabel(item);
            return (
                <MenuItem
                    active={modifiers.active}
                    disabled={modifiers.disabled}
                    key={item.type === "environment" ? item.environmentId : "latest"}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    roleStructure="listoption"
                    textClassName={classNames({
                        [Classes.SKELETON]: label == null,
                    })}
                    text={label ?? "SKELETON_TEXT"}
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
