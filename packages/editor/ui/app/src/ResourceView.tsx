import { Code, EditableText, H2, Icon, Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import styles from "./ResourceView.module.scss";

export const ResourceView: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <Icon icon={IconNames.CUBE} size={30} />
                <H2 className={styles.title}>
                    <EditableText value="Blog Post"></EditableText>
                </H2>
                <Tag intent={Intent.SUCCESS} large minimal>
                    General availability
                </Tag>
            </div>
            <EditableText value="" placeholder="Enter a description..."></EditableText>
            <div className={styles.table}>
                <div>
                    <Code>ID</Code>
                </div>
                <div>
                    <Code>string</Code>
                </div>
                <div>
                    <Code>title</Code>
                </div>
                <div>
                    <Code>string</Code>
                </div>
            </div>
        </div>
    );
};
