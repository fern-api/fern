import { generatorsYml } from '@fern-api/configuration-loader'
import { NodePath } from '@fern-api/fern-definition-schema'

export type GeneratorsYmlFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof GeneratorsYmlFileAstNodeTypes]: GeneratorsYmlFileAstNodeVisitor<K, R>
}

export interface GeneratorsYmlFileAstNodeTypes {
    file: generatorsYml.GeneratorsConfigurationSchema
    generatorInvocation: {
        invocation: generatorsYml.GeneratorInvocationSchema
        cliVersion: string
    }
}

export type GeneratorsYmlFileAstNodeVisitor<K extends keyof GeneratorsYmlFileAstNodeTypes, R = void | Promise<void>> = (
    node: GeneratorsYmlFileAstNodeTypes[K],
    nodePath: NodePath
) => R
