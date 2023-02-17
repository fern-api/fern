import { MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select2, SelectPopoverProps } from "@blueprintjs/select";
import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { FernRoutes } from "../../../../routes";
import { useCurrentApiId } from "../../../../routes/getCurrentApiId";
import { useCurrentEnvironment } from "../../../../routes/useCurrentEnvironment";
import { useAllEnvironments } from "../../../queries/useAllEnvironments";
import { ApiVersionSelectButton } from "./ApiVersionSelectButton";

const POPOVER_PROPS: SelectPopoverProps["popoverProps"] = {
    matchTargetWidth: true,
};

export const ApiVersionSelect: React.FC = () => {
    const currentApiId = useCurrentApiId();
    const currentEnvironment = useCurrentEnvironment();
    const environments = useAllEnvironments();

    const navigate = useNavigate();

    const onItemSelect = useCallback(
        (newEnvironment: FernRegistry.Environment) => {
            if (currentApiId == null || newEnvironment.id === currentEnvironment?.id) {
                return;
            }
            navigate(
                generatePath(FernRoutes.API_DEFINITION.absolutePath, {
                    [FernRoutes.API_DEFINITION.parameters.API_ID]: currentApiId,
                    [FernRoutes.API_DEFINITION.parameters.ENVIRONMENT]: newEnvironment.id,
                })
            );
        },
        [currentApiId, currentEnvironment?.id, navigate]
    );

    if (environments.type !== "loaded" || !environments.value.ok) {
        return <ApiVersionSelectButton environmentName={undefined} />;
    }

    return (
        <Select2<FernRegistry.Environment>
            items={environments.value.body.environments}
            activeItem={currentEnvironment}
            filterable={false}
            itemRenderer={renderFilm}
            noResults={<MenuItem disabled text="No results." roleStructure="listoption" />}
            onItemSelect={onItemSelect}
            popoverProps={POPOVER_PROPS}
        >
            <ApiVersionSelectButton environmentName={currentEnvironment?.displayName} />
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
            text={item.displayName}
        />
    );
};
