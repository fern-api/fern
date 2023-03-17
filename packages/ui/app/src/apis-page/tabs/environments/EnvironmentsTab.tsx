import { Button, Intent, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { mapLoadableArray } from "@fern-api/loadable";
import { useAllEnvironments } from "../../../queries/useAllEnvironments";
import { useOpenCreateEnvironmentForm } from "../../forms-context/context";
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
            <div className="flex flex-col gap-10">
                {mapLoadableArray(allEnvironments, (loadedEnvironments) => loadedEnvironments.environments, {
                    numLoading: 1,
                }).map((environment, index) => (
                    <EnvironmentCard key={index} environment={environment} />
                ))}
            </div>
        </div>
    );
};
