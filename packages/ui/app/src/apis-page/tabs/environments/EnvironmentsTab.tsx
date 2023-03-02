import { Button, Intent, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { mapLoadableArray } from "@fern-api/loadable";
import { useOpenCreateEnvironmentForm } from "../../../contexts";
import { useAllEnvironments } from "../../../queries/useAllEnvironments";
import { EnvironmentCard } from "./EnvironmentCard";

export const EnvironmentsTab: React.FC = () => {
    const allEnvironments = useAllEnvironments();
    const openCreateEnvironmentForm = useOpenCreateEnvironmentForm();

    if (allEnvironments.type === "loaded" && allEnvironments.value.environments.length === 0) {
        return (
            <NonIdealState
                title="No environments"
                action={
                    <Button
                        icon={IconNames.ADD}
                        text="Create"
                        intent={Intent.SUCCESS}
                        onClick={openCreateEnvironmentForm}
                    />
                }
            />
        );
    }

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
                <div className="text-lg">Environments</div>
                <Button
                    icon={IconNames.ADD}
                    text="Create"
                    intent={Intent.SUCCESS}
                    minimal
                    onClick={openCreateEnvironmentForm}
                />
            </div>
            {mapLoadableArray(allEnvironments, (loadedEnvironments) => loadedEnvironments.environments).map(
                (environment, index) => (
                    <EnvironmentCard key={index} environment={environment} />
                )
            )}
        </div>
    );
};
