import { GeneratorNotificationService } from "@fern-api/base-generator";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { AbstractTypescriptMcpGeneratorContext, AsIsFiles } from "@fern-api/typescript-mcp-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
export class ServerGeneratorContext extends AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema> {
    public constructor(
        public readonly ir: FernIr.IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: TypescriptCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
    }

    public getRawAsIsFiles(): string[] {
        return [
            AsIsFiles.GitIgnore,
            AsIsFiles.IndexTs,
            AsIsFiles.ServerCustomTs,
            AsIsFiles.ServerTs,
            AsIsFiles.TsConfigJson
        ];
    }
}
