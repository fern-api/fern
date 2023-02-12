import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useCurrentApiDefinition } from "../../queries/useCurrentApiDefinition";
import styles from "./DefinitionSidebar.module.scss";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";
import { ApiVersionSelect } from "./version-chooser/ApiVersionSelect";

export const DefinitionSidebar: React.FC = () => {
    const api = useCurrentApiDefinition();

    if (api.type !== "loaded" || !api.value.ok) {
        return null;
    }

    return (
        <div className={styles.container}>
            <ApiVersionSelect
                environments={[
                    {
                        id: FernRegistry.EnvironmentId("staging"),
                        displayName: "Staging",
                    },
                ]}
            />
            <PackageSidebarSectionContents
                packagePathIncludingSelf={EMPTY_ARRAY}
                endpoints={api.value.body.endpoints}
                subPackages={api.value.body.packages}
            />
        </div>
    );
};
