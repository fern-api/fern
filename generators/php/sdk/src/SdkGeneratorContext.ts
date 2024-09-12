import { AbstractPhpGeneratorContext } from "@fern-api/php-codegen";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { AsIsFiles } from "@fern-api/php-codegen";

export class SdkGeneratorContext extends AbstractPhpGeneratorContext<SdkCustomConfigSchema> {
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore, AsIsFiles.PhpStanNeon, AsIsFiles.PhpUnitXml];
    }

    public getCoreAsIsFiles(): string[] {
        return [
            AsIsFiles.BaseApiRequest,
            AsIsFiles.ClientOptions,
            AsIsFiles.HttpMethod,
            AsIsFiles.JsonApiRequest,
            AsIsFiles.RawClient
        ];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [AsIsFiles.RawClientTest];
    }
}
