import styles from "./TreeNode.module.scss";

export declare namespace TreeNode {
    export interface Props {
        title: JSX.Element | string;
        body?: JSX.Element | string;
        children?: (args: { className?: string }) => JSX.Element;
    }
}

export const TreeNode: React.FC<TreeNode.Props> = ({ title, body, children }) => {
    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <div className={styles.dash} />
                {title}
            </div>
            {body != null && <div className={styles.body}>{body}</div>}
            {children != null && (
                <div className={styles.childrenWrapper}>{children({ className: styles.children })}</div>
            )}
        </div>
    );
};
