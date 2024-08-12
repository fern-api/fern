import { GeneratorsConfigurationSchema } from "../..";
import { NodePath } from "../../../NodePath";

export type GeneratorsYmlFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof GeneratorsYmlFileAstNodeTypes]: GeneratorsYmlFileAstNodeVisitor<K, R>;
};

export interface GeneratorsYmlFileAstNodeTypes {
    file: GeneratorsConfigurationSchema;
}

export type GeneratorsYmlFileAstNodeVisitor<K extends keyof GeneratorsYmlFileAstNodeTypes, R = void | Promise<void>> = (
    node: GeneratorsYmlFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
