import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { useCurrentApiDefinition } from "../queries/useCurrentApiDefinition";
import styles from "./ApiDefinition.module.scss";
import { PackageDefinitionContents } from "./PackageDefinitionContents";

export const ApiDefinition: React.FC = () => {
    const api = useCurrentApiDefinition();

    if (api.type !== "loaded" || !api.value.ok) {
        return null;
    }

    return (
        <div className={styles.container}>
            <PackageDefinitionContents
                packagePathIncludingSelf={EMPTY_ARRAY}
                subPackages={api.value.body.packages}
                endpoints={api.value.body.endpoints}
            />
        </div>
    );
};
