import { GeneratorNotificationService } from "@fern-api/base-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbstractSwiftGeneratorContext } from "@fern-api/swift-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { ReadmeConfigBuilder } from "./readme";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SwiftGeneratorAgent } from "./SwiftGeneratorAgent";

type SPMDetails = {
    gitUrl: string | null;
    minVersion: string | null;
};

export class SdkGeneratorContext extends AbstractSwiftGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: SwiftGeneratorAgent;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.generatorAgent = new SwiftGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            ir: this.ir
        });
    }

    public getSPMDetails() {
        return this.config.output.mode._visit<SPMDetails>({
            downloadFiles: () => ({
                gitUrl: null,
                minVersion: null
            }),
            publish: (publishConfig) => ({
                gitUrl: null,
                minVersion: publishConfig.version
            }),
            github: (outputMode) => ({
                gitUrl: outputMode.repoUrl,
                minVersion: outputMode.version
            }),
            _other: () => ({
                gitUrl: null,
                minVersion: null
            })
        });
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }
}
