import { EndpointParameter } from "./EndpointParameter";
import styles from "./EndpointParametersSection.module.scss";
import { EndpointSection } from "./EndpointSection";

export declare namespace EndpointParametersSection {
    export interface Props {
        title: string;
        parameters: EndpointParameter.Props[];
    }
}

export const EndpointParametersSection: React.FC<EndpointParametersSection.Props> = ({ title, parameters }) => {
    return (
        <EndpointSection title={title}>
            <div className={styles.parameters}>
                {parameters.map((parameter, index) => (
                    <EndpointParameter key={index} {...parameter} />
                ))}
            </div>
        </EndpointSection>
    );
};
