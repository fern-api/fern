import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRustGeneratorContext } from "@fern-api/rust-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractRustGeneratorContext<ModelCustomConfigSchema> {
    // Constructor removed as it was useless - just called super with same parameters
}
