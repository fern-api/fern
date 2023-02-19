import { FernRegistry } from "@fern-fern/registry";
import { useEffect, useState } from "react";
import { useCurrentEnvironment } from "../../../routes/useCurrentEnvironment";
import { ApiDefinitionContextProvider } from "../../api-context/ApiDefinitionContextProvider";
import { useAllEnvironments } from "../../queries/useAllEnvironments";
import { ApiDefinitionSidebarContextProvider } from "./context/ApiDefinitionSidebarContextProvider";
import styles from "./DefinitionSidebar.module.scss";
import { DefinitionSidebarItems } from "./DefinitionSidebarItems";
import { EnvironmentSelect } from "./environment-select/EnvironmentSelect";

export const DefinitionSidebar: React.FC = () => {
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

    if (selectedEnvironment == null) {
        return null;
    }

    return (
        <ApiDefinitionContextProvider environmentId={selectedEnvironment.id}>
            <ApiDefinitionSidebarContextProvider environmentId={selectedEnvironment.id}>
                <div className={styles.container}>
                    <EnvironmentSelect selectedEnvironment={selectedEnvironment} onChange={setSelectedEnvironment} />
                    <DefinitionSidebarItems />
                </div>
            </ApiDefinitionSidebarContextProvider>
        </ApiDefinitionContextProvider>
    );
};
