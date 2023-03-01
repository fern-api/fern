import { InputGroup } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useState } from "react";
import { ApiDefinitionContextProvider } from "../../api-context/ApiDefinitionContextProvider";
import { ParsedEnvironmentId, useCurrentEnvironmentId } from "../../routes/useCurrentEnvironment";
import { ApiDefinitionSidebarContextProvider } from "./context/ApiDefinitionSidebarContextProvider";
import { DefinitionSidebarItems } from "./DefinitionSidebarItems";
import { EnvironmentSelect } from "./environment-select/EnvironmentSelect";

export const DefinitionSidebar: React.FC = () => {
    const currentEnvironmentId = useCurrentEnvironmentId();
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<ParsedEnvironmentId>(currentEnvironmentId);

    return (
        <ApiDefinitionContextProvider environmentId={selectedEnvironmentId}>
            <ApiDefinitionSidebarContextProvider environmentId={selectedEnvironmentId}>
                <div className="flex-1 flex flex-col min-w-0 bg-stone-100">
                    <div className="flex flex-col m-3 gap-3">
                        <InputGroup leftIcon={IconNames.SEARCH} placeholder="Search..." />
                        <EnvironmentSelect
                            selectedEnvironmentId={selectedEnvironmentId}
                            onChange={setSelectedEnvironmentId}
                        />
                    </div>
                    <DefinitionSidebarItems />
                </div>
            </ApiDefinitionSidebarContextProvider>
        </ApiDefinitionContextProvider>
    );
};
