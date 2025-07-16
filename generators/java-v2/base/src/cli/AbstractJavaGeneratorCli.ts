import { AbstractGeneratorCli, parseIR } from '@fern-api/base-generator'
import { AbsoluteFilePath } from '@fern-api/fs-utils'
import { BaseJavaCustomConfigSchema } from '@fern-api/java-ast'

import { IntermediateRepresentation } from '@fern-fern/ir-sdk/api'
import * as IrSerialization from '@fern-fern/ir-sdk/serialization'

import { AbstractJavaGeneratorContext } from '../context/AbstractJavaGeneratorContext'

export abstract class AbstractJavaGeneratorCli<
    CustomConfig extends BaseJavaCustomConfigSchema,
    JavaGeneratorContext extends AbstractJavaGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, JavaGeneratorContext> {
    /**
     * Parses the IR for the Java generators
     * @param irFilepath
     * @returns
     */
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        })
    }
}
