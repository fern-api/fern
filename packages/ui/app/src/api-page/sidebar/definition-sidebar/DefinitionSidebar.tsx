import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { useApiContext } from "../../context/useApiContext";
import styles from "./DefinitionSidebar.module.scss";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";
import { ApiVersionSelect } from "./version-chooser/ApiVersionSelect";

export const DefinitionSidebar: React.FC = () => {
    const { api } = useApiContext();

    if (api.type !== "loaded") {
        return null;
    }

    return (
        <div className={styles.container}>
            <ApiVersionSelect />
            <PackageSidebarSectionContents package={api.value.rootPackage} ancestorPackageNames={EMPTY_ARRAY} />
        </div>
    );
};
