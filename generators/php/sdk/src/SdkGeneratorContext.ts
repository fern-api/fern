import { AbstractPhpGeneratorContext } from "@fern-api/php-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export const MOCK_SERVER_TEST_FOLDER = RelativeFilePath.of("Unit/MockServer");

export class SdkGeneratorContext extends AbstractPhpGeneratorContext<SdkCustomConfigSchema> {
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
    }
}
