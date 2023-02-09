import { useApiContext } from "./context/useApiContext";
import styles from "./DefinitionSidebar.module.scss";
import { ServiceSidebarSection } from "./ServiceSidebarSection";

export const DefinitionSidebar: React.FC = () => {
    const { api } = useApiContext();

    if (api.type !== "loaded") {
        return null;
    }

    return (
        <div className={styles.container}>
            {api.value.services.map((service, serviceIndex) => (
                <ServiceSidebarSection key={serviceIndex} service={service} serviceIndex={serviceIndex} />
            ))}
        </div>
    );
};
