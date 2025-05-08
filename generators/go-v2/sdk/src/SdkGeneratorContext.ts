import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractGoGeneratorContext } from "@fern-api/go-ast";
import { GoProject } from "@fern-api/go-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { GoGeneratorAgent } from "./GoGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class SdkGeneratorContext extends AbstractGoGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: GoGeneratorAgent;
    public readonly project: GoProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new GoProject({ context: this });
        this.generatorAgent = new GoGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            ir
=======
            ir,
>>>>>>> 1a7aff3095 (fix(go): go generator compiles (#7031))
=======
            ir
>>>>>>> 1b4761ccff (fix(lint): auto-fix lint issues (#7032))
=======
            ir
=======
            ir,
>>>>>>> fcf801a9bd (fix(go): go generator compiles (#7031))
>>>>>>> bfb7bc7b15 (fix(go): go generator compiles (#7031))
=======
            ir
>>>>>>> 00e140f9d9 (fix(lint): auto-fix lint issues (#7032))
        });
    }
}
