import { InputGroup } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { FernRegistry } from "@fern-fern/registry";
import { useEffect, useState } from "react";
import { useCurrentEnvironment } from "../../../routes/useCurrentEnvironment";
import { ApiDefinitionContextProvider } from "../../api-context/ApiDefinitionContextProvider";
import { useAllEnvironments } from "../../queries/useAllEnvironments";
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
    (environment: FernRegistry.Environment) => void
] {
    const allEnvironments = useAllEnvironments();
    const currentEnvironment = useCurrentEnvironment();

    const [selectedEnvironment, setSelectedEnvironment] = useState<FernRegistry.Environment>();

    useEffect(() => {
        if (selectedEnvironment == null) {
            if (currentEnvironment != null) {
                setSelectedEnvironment(currentEnvironment);
            } else if (allEnvironments.type === "loaded") {
                const firstEnvironment = allEnvironments.value.environments[0];
                if (firstEnvironment != null) {
                    setSelectedEnvironment(firstEnvironment);
                }
            }
        }
    }, [allEnvironments, currentEnvironment, selectedEnvironment]);

    return [selectedEnvironment, setSelectedEnvironment];
}
