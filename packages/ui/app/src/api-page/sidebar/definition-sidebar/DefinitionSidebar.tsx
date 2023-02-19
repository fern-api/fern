import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import styles from "./DefinitionSidebar.module.scss";
import { EnvironmentSelect } from "./environment-select/EnvironmentSelect";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";

export const DefinitionSidebar: React.FC = () => {
    const { api } = useApiDefinitionContext();

    if (api.type !== "loaded") {
        return null;
    }

    return (
        <div className={styles.container}>
            <EnvironmentSelect />
            <PackageSidebarSectionContents package={api.value.rootPackage} packagePath={EMPTY_ARRAY} />
        </div>
    );
};
