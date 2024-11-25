import { dynamic as DynamicSnippets, generatorExec as GeneratorExec } from "@fern-api/dynamic-ir-sdk/api";
import { DynamicSnippetsGenerator as Go } from "@fern-api/go-dynamic-snippets";
import { EndpointProvider } from "./EndpointProvider";
import { Language } from "./Language";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { OpenAPI } from "openapi-types";
import go from "./config/go/config.json";
import ir from "./config/ir/ir.json";
import { FernWorkspace, loadParsedOpenAPIWorkspace } from "@fern-api/workspace-loader";
import { createMockTaskContext } from "@fern-api/task-context";

export class SnippetResolver {
    private ir: DynamicSnippets.DynamicIntermediateRepresentation;
    private workspace: FernWorkspace | undefined;

    constructor() {
        this.ir = ir as unknown as DynamicSnippets.DynamicIntermediateRepresentation;
    }

    public async sdk(language: Language): Promise<EndpointProvider> {
        const ir = this.workspace != null ? await this.generateIr({ workspace: this.workspace, language }) : this.ir;
        return this.getGeneratorForLanguage({ ir, language });
    }

    public async loadAPI(openapi: OpenAPI.Document): Promise<void> {
        const result = await loadParsedOpenAPIWorkspace({
            specs: [
                {
                    type: "openapi",
                    parsed: openapi
                    // TODO: Add option for overrides and settings.
                }
            ],
            generatorsConfigurationSchema: {
                // TODO: Add option for generator configuration.
            },
            cliVersion: "*" // TODO: Resolve from configuration.
        });
        if (result.didSucceed) {
            this.workspace = await result.workspace.toFernWorkspace({ context: createMockTaskContext() });
            return;
        }
        throw new Error(`Failed to load workspace: ${result.failures}`);
    }

    private getGeneratorForLanguage({
        ir,
        language
    }: {
        ir: DynamicSnippets.DynamicIntermediateRepresentation;
        language: Language;
    }): EndpointProvider {
        switch (language) {
            case "go": {
                const config = this.getGeneratorConfigForLanguage(language);
                return new EndpointProvider({ ir, generator: new Go({ ir, config }) });
            }
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    private getGeneratorConfigForLanguage(language: Language): GeneratorExec.config.GeneratorConfig {
        switch (language) {
            case "go": {
                return go as unknown as GeneratorExec.config.GeneratorConfig;
            }
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    private async generateIr({
        workspace,
        language
    }: {
        workspace: FernWorkspace;
        language: Language;
    }): Promise<DynamicSnippets.DynamicIntermediateRepresentation> {
        const ir = await generateIntermediateRepresentation({
            workspace,
            generationLanguage: language,
            keywords: undefined,
            smartCasing: true, // TODO: Resolve from configuration.
            disableExamples: true,
            audiences: { type: "all"},
            readme: undefined,
            packageName: undefined,
            version: undefined, // TODO: Resolve from configuration.
            context: createMockTaskContext()
        });
        const dynamicIr = ir.dynamic as unknown as DynamicSnippets.DynamicIntermediateRepresentation;
        this.ir = dynamicIr;
        return dynamicIr;
    }
}
