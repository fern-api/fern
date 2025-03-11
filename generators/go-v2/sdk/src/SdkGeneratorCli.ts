import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { AbstractGoGeneratorCli } from "@fern-api/go-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { WireTestGenerator } from "./wiretest/WireTestGenerator";

export class SdkGeneratorCLI extends AbstractGoGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return {};
    }

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        // TODO: Enable wire tests, when available.
        // this.generateWireTests(context);

        if (context.config.output.snippetFilepath != null) {
            try {
                await this.generateReadme({
                    context,
                    // TODO: Support (and indeed require there to be) snippets
                    endpointSnippets: []
                });
            } catch (e) {
                context.logger.warn("Failed to generate README.md, this is OK.");
            }
        }

        await context.project.persist();
    }

    private async generateReadme({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }): Promise<void> {
        // TODO: Support (and indeed require there to be) snippets
        // if (endpointSnippets.length === 0) {
        //     context.logger.debug("No snippets were produced; skipping README.md generation.");
        //     return;
        // }
        const content = await context.generatorAgent.generateReadme({ context, endpointSnippets });
        context.project.addRawFiles(
            new File(context.generatorAgent.README_FILENAME, RelativeFilePath.of("."), content)
        );
    }

    private generateWireTests(context: SdkGeneratorContext) {
        const wireTestGenerator = new WireTestGenerator(context);
        for (const subpackage of Object.values(context.ir.subpackages)) {
            const serviceId = subpackage.service != null ? subpackage.service : undefined;
            if (serviceId == null) {
                continue;
            }
            const service = context.getHttpServiceOrThrow(serviceId);
            context.project.addGoFiles(wireTestGenerator.generate({ serviceId, endpoints: service.endpoints }));
        }
    }
}
