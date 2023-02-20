import { H2 } from "@blueprintjs/core";
import styles from "./DefinitionPage.module.scss";

export declare namespace DefinitionPage {
    export interface Props {
        title: JSX.Element | string;
        subtitle?: JSX.Element | string;
        docs?: string;
        leftContent?: JSX.Element;
        rightContent?: JSX.Element;
    }
}

export const DefinitionPage: React.FC<DefinitionPage.Props> = ({
    title,
    subtitle,
    docs,
    leftContent,
    rightContent,
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <H2 className={styles.title}>{title}</H2>
                {subtitle != null && <div className={styles.subtitle}>{subtitle}</div>}
            </div>
            <div className={styles.body}>
                <div className={styles.leftContent}>
                    {docs != null && <div>{docs}</div>}
                    {leftContent}
                </div>
                {rightContent != null && <div className={styles.rightContent}>{rightContent}</div>}
            </div>
        </div>
    );
};
