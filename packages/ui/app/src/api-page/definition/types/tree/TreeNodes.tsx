import { SmallMutedText } from "../SmallMutedText";
import { TreeNode } from "./TreeNode";
import styles from "./TreeNodes.module.scss";

export declare namespace TreeNodes {
    export interface Props {
        nodes: readonly TreeNode.Props[];
        fallback?: string;
    }
}

export const TreeNodes: React.FC<TreeNodes.Props> = ({ nodes, fallback }) => {
    if (nodes.length === 0) {
        return fallback != null ? <SmallMutedText>{fallback}</SmallMutedText> : null;
    }
    return (
        <div className={styles.container}>
            {nodes.map((node, index) => (
                <TreeNode key={index} {...node} />
            ))}
        </div>
    );
};
