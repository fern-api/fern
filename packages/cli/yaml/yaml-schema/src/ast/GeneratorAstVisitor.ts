import { generatorsYml } from "@fern-api/configuration";
import { NodePath } from "../NodePath";

export type GeneratorAstVisitor<R = void | Promise<void>> = {
    [K in keyof GeneratorAstNodeTypes]: GeneratorAstNodeVisitor<K, R>;
};

export interface GeneratorAstNodeTypes {
    api: generatorsYml.APIDefinitionSchema | undefined;
}

export type GeneratorAstNodeVisitor<K extends keyof GeneratorAstNodeTypes, R = void | Promise<void>> = (
    node: GeneratorAstNodeTypes[K],
    nodePath: NodePath
) => R;
