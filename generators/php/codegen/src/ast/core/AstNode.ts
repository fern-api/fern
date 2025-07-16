import { AbstractAstNode } from '@fern-api/browser-compatible-base-generator'

import { BasePhpCustomConfigSchema } from '../../custom-config/BasePhpCustomConfigSchema'
import { Writer } from './Writer'

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public toString(param: {
        namespace: string
        rootNamespace: string
        customConfig: BasePhpCustomConfigSchema
        skipImports?: boolean
    }): string {
        if (param == null) {
            // You are likely implicitly calling toString() inside a string interpolation or concatenation.
            // Don't do this:
            //  - astNode.toString()
            //  - `${astNode}`
            //  - "Foo<" + astNode + ">"

            throw new Error('Internal error; AstNode.toString method called incorrectly.')
        }
        const { namespace, rootNamespace, customConfig, skipImports = false } = param

        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig
        })
        this.write(writer)
        return writer.toString(skipImports)
    }

    /**
     * Writes the node to a string.
     */
    public async toStringAsync({
        namespace,
        rootNamespace,
        customConfig
    }: {
        namespace: string
        rootNamespace: string
        customConfig: BasePhpCustomConfigSchema
    }): Promise<string> {
        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig
        })
        this.write(writer)
        return writer.toString()
    }
}
