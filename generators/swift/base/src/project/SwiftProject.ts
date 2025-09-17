import { AbstractProject } from "@fern-api/base-generator";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";

import { AbstractSwiftGeneratorContext } from "../context/AbstractSwiftGeneratorContext";

export class SwiftProject extends AbstractProject<AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>> {
    public constructor({ context }: { context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema> }) {
        super(context);
    }

    public async persist(): Promise<void> {
        // TODO: Implement
    }
}
