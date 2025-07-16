import { AbstractGeneratorCli, parseIR } from '@fern-api/base-generator'
import { AbsoluteFilePath } from '@fern-api/fs-utils'
import { BaseSwiftCustomConfigSchema } from '@fern-api/swift-codegen'

import { IntermediateRepresentation } from '@fern-fern/ir-sdk/api'
import * as IrSerialization from '@fern-fern/ir-sdk/serialization'

import { AbstractSwiftGeneratorContext } from '../context/AbstractSwiftGeneratorContext'

export abstract class AbstractSwiftGeneratorCli<
    CustomConfig extends BaseSwiftCustomConfigSchema,
    SwiftGeneratorContext extends AbstractSwiftGeneratorContext<CustomConfig>
> extends AbstractGeneratorCli<CustomConfig, IntermediateRepresentation, SwiftGeneratorContext> {
    protected async parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation> {
        return await parseIR<IntermediateRepresentation>({
            absolutePathToIR: AbsoluteFilePath.of(irFilepath),
            parse: IrSerialization.IntermediateRepresentation.parse
        })
    }
}
