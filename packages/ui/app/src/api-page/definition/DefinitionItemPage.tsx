import { Divider, H2 } from "@blueprintjs/core";
import styles from "./DefinitionItemPage.module.scss";

export declare namespace DefinitionItemPage {
    export interface Props {
        title: JSX.Element | string;
        subtitle?: JSX.Element | string;
        docs?: string;
        leftContent?: JSX.Element;
        rightContent?: JSX.Element;
    }
}

export const DefinitionItemPage: React.FC<DefinitionItemPage.Props> = ({
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
            <Divider className="my-3" />
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
