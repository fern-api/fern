import { useApiContext } from "../context/useApiContext";
import styles from "./ApiDefinition.module.scss";
import { Service } from "./Service";

export const ApiDefinition: React.FC = () => {
    const { api } = useApiContext();

    if (api.type !== "loaded") {
        return null;
    }

    return (
        <div className={styles.container}>
            {api.value.services.map((service, serviceIndex) => (
                <Service key={serviceIndex} service={service} serviceIndex={serviceIndex} />
            ))}
        </div>
    );
};
