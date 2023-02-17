import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { useApiContext } from "../../api-context/useApiContext";
import styles from "./DefinitionSidebar.module.scss";
import { EnvironmentSelect } from "./environment-select/EnvironmentSelect";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";

export const DefinitionSidebar: React.FC = () => {
    const { api } = useApiContext();

    if (api.type !== "loaded") {
        return null;
    }

    return (
        <div className={styles.container}>
            <EnvironmentSelect />
            <PackageSidebarSectionContents package={api.value.rootPackage} ancestorPackageNames={EMPTY_ARRAY} />
        </div>
    );
};
