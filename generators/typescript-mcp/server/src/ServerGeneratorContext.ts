import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractTypescriptMcpGeneratorContext, AsIsFiles } from "@fern-api/typescript-mcp-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { TypescriptCustomConfigSchema } from "../../../typescript-v2/ast/src";

export class ServerGeneratorContext extends AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema> {
    public constructor(
        public readonly ir: IntermediateRepresentation,
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
