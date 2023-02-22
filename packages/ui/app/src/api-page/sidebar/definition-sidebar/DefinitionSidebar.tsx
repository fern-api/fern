import { InputGroup } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { FernRegistry } from "@fern-fern/registry";
import { useEffect, useMemo, useState } from "react";
import { useAllEnvironments } from "../../../queries/useAllEnvironments";
import { ApiDefinitionContextProvider } from "../../api-context/ApiDefinitionContextProvider";
import { useCurrentEnvironmentId } from "../../routes/useCurrentEnvironment";
import { ApiDefinitionSidebarContextProvider } from "./context/ApiDefinitionSidebarContextProvider";
import { DefinitionSidebarItems } from "./DefinitionSidebarItems";
import { EnvironmentSelect } from "./environment-select/EnvironmentSelect";

export const DefinitionSidebar: React.FC = () => {
    const [selectedEnvironment, setSelectedEnvironment] = useSelectedEnvironmentState();
    if (selectedEnvironment == null) {
        return null;
    }

    return (
        <ApiDefinitionContextProvider environmentId={selectedEnvironment.id}>
            <ApiDefinitionSidebarContextProvider environmentId={selectedEnvironment.id}>
                <div className="flex-1 flex flex-col min-w-0 bg-stone-100">
                    <div className="flex flex-col m-3 gap-3">
                        <InputGroup leftIcon={IconNames.SEARCH} placeholder="Search..." />
                        <EnvironmentSelect
                            selectedEnvironment={selectedEnvironment}
                            onChange={setSelectedEnvironment}
                        />
                    </div>
                    <DefinitionSidebarItems />
                </div>
            </ApiDefinitionSidebarContextProvider>
        </ApiDefinitionContextProvider>
    );
};

function useSelectedEnvironmentState(): [
    FernRegistry.Environment | undefined,
    (environment: FernRegistry.EnvironmentId) => void
] {
    const allEnvironments = useAllEnvironments();
    const currentEnvironmentId = useCurrentEnvironmentId();

    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(currentEnvironmentId);

    useEffect(() => {
        if (selectedEnvironmentId == null && allEnvironments.type === "loaded") {
            setSelectedEnvironmentId(allEnvironments.value.environments[0]?.id);
        }
    }, [allEnvironments, selectedEnvironmentId]);

    const selectedEnvironment = useMemo(() => {
        if (allEnvironments.type !== "loaded" || selectedEnvironmentId == null) {
            return undefined;
        }
        return allEnvironments.value.environments.find((environment) => environment.id === selectedEnvironmentId);
    }, [allEnvironments, selectedEnvironmentId]);

    return [selectedEnvironment, setSelectedEnvironmentId];
}
