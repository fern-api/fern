import { GeneratorError, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractSwiftGeneratorContext } from "@fern-api/swift-base";
import { DynamicSnippetsGenerator } from "@fern-api/swift-dynamic-snippets";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { ReadmeConfigBuilder } from "./readme/index.js";
import { SdkCustomConfigSchema } from "./SdkCustomConfig.js";
import { SwiftGeneratorAgent } from "./SwiftGeneratorAgent.js";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest.js";
import { convertIr } from "./utils/convertIr.js";
import { selectExamplesForSnippets } from "./utils/selectExamplesForSnippets.js";

type SPMDetails = {
    gitUrl: string | null;
    minVersion: string | null;
};

export class SdkGeneratorContext extends AbstractSwiftGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: SwiftGeneratorAgent;
    private _dynamicSnippetsGenerator: DynamicSnippetsGenerator | undefined;
    private readonly endpointSnippetsById = new Map<FernIr.EndpointId, string | undefined>();

    public constructor(
        public readonly ir: FernIr.IntermediateRepresentation,
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

    public get dynamicSnippetsGenerator(): DynamicSnippetsGenerator {
        if (this._dynamicSnippetsGenerator == null) {
            const dynamicIr = this.ir.dynamic;
            if (!dynamicIr) {
                throw GeneratorError.internalError("Cannot generate dynamic snippets without dynamic IR");
            }
            this._dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
                ir: convertIr(dynamicIr),
                config: this.config
            });
        }
        return this._dynamicSnippetsGenerator;
    }

    public getEndpointSnippet(endpoint: FernIr.HttpEndpoint): string | undefined {
        if (this.endpointSnippetsById.has(endpoint.id)) {
            return this.endpointSnippetsById.get(endpoint.id);
        }
        const snippet = this.generateEndpointSnippet(endpoint);
        this.endpointSnippetsById.set(endpoint.id, snippet);
        return snippet;
    }

    private generateEndpointSnippet(endpoint: FernIr.HttpEndpoint): string | undefined {
        try {
            const examples = this.ir.dynamic?.endpoints[endpoint.id]?.examples;
            const example = selectExamplesForSnippets(examples)[0];
            if (example == null) {
                return undefined;
            }
            const response = this.dynamicSnippetsGenerator.generateSync(convertDynamicEndpointSnippetRequest(example));
            const snippet = response.snippet.trim();
            return snippet !== "" ? snippet : undefined;
        } catch (error) {
            this.logger.debug(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
            return undefined;
        }
    }
}
