import styles from "./TreeNode.module.scss";

export declare namespace TreeNode {
    export type Props = React.PropsWithChildren<{
        title: JSX.Element | string;
        body?: JSX.Element | string;
    }>;
}

export const TreeNode: React.FC<TreeNode.Props> = ({ title, body, children }) => {
    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <div className={styles.dash} />
                {title}
            </div>
            {body != null && <div className={styles.body}>{body}</div>}
            {children != null && <div className={styles.children}>{children}</div>}
        </div>
    );
};
