import { MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select2, SelectPopoverProps } from "@blueprintjs/select";
import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { generatePath, matchPath, useLocation, useNavigate } from "react-router-dom";
import { FernRoutes } from "../../../../routes";
import { useCurrentEnvironment } from "../../../../routes/useCurrentEnvironment";
import { useAllEnvironments } from "../../../queries/useAllEnvironments";
import { EnvironmentSelectButton } from "./EnvironmentSelectButton";

const POPOVER_PROPS: SelectPopoverProps["popoverProps"] = {
    matchTargetWidth: true,
};

export const EnvironmentSelect: React.FC = () => {
    const currentEnvironment = useCurrentEnvironment();
    const environments = useAllEnvironments();

    const location = useLocation();
    const navigate = useNavigate();

    const onItemSelect = useCallback(
        (newEnvironment: FernRegistry.Environment) => {
            if (currentEnvironment?.id === newEnvironment.id) {
                return;
            }

            const currentPath = matchPath(FernRoutes.API_DEFINITION_PACKAGE.absolutePath, location.pathname);
            if (currentPath == null) {
                return;
            }

            const {
                [FernRoutes.API_DEFINITION_PACKAGE.parameters.API_ID]: apiId,
                [FernRoutes.API_DEFINITION_PACKAGE.parameters.ENVIRONMENT]: currentEnvironmentId,
                [FernRoutes.API_DEFINITION_PACKAGE.parameters["*"]]: splat,
            } = currentPath.params;

            if (apiId == null || currentEnvironmentId == null) {
                return;
            }

            navigate(
                generatePath(FernRoutes.API_DEFINITION_PACKAGE.absolutePath, {
                    [FernRoutes.API_DEFINITION.parameters.API_ID]: apiId,
                    [FernRoutes.API_DEFINITION.parameters.ENVIRONMENT]: newEnvironment.id,
                    "*": splat ?? "",
                })
            );
        },
        [currentEnvironment?.id, location.pathname, navigate]
    );

    if (environments.type !== "loaded" || !environments.value.ok) {
        return <EnvironmentSelectButton environmentName={undefined} />;
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
            <EnvironmentSelectButton environmentName={currentEnvironment?.displayName} />
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
