import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRustGeneratorContext, AsIsFileDefinition, AsIsFiles } from "@fern-api/rust-base";
import { ModelCustomConfigSchema, ModelGeneratorContext } from "@fern-api/rust-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { RustGeneratorAgent } from "./RustGeneratorAgent.js";
import { ReadmeConfigBuilder } from "./readme/index.js";
import { SdkCustomConfigSchema } from "./SdkCustomConfig.js";

export class SdkGeneratorContext extends AbstractRustGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: RustGeneratorAgent;

    constructor(
        ir: FernIr.IntermediateRepresentation,
        generatorConfig: FernGeneratorExec.GeneratorConfig,
        customConfig: SdkCustomConfigSchema,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, generatorConfig, customConfig, generatorNotificationService);
        this.generatorAgent = new RustGeneratorAgent({
            logger: this.logger,
            config: generatorConfig,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            ir
        });
    }

    public getApiClientBuilderClientName(): string {
        // For api_client_builder.rs template, we need to reference the actual client that exists
        const subpackages = this.ir.rootPackage.subpackages
            .map((subpackageId) => this.getSubpackageOrThrow(subpackageId))
            .filter((subpackage) => subpackage.service != null || subpackage.hasEndpointsInTree);

        if (subpackages.length === 1 && subpackages[0] != null) {
            // Single service - use the sub-client name (now from registry)
            return this.getUniqueClientNameForSubpackage(subpackages[0]);
        } else {
            // Multiple services or no subpackages - use the root client name (now from registry)
            return this.getClientName();
        }
    }

    public getCoreAsIsFiles(): AsIsFileDefinition[] {
        const files = Object.values(AsIsFiles);
        // Only include sse_stream.rs when there are streaming endpoints
        if (!this.hasStreamingEndpoints()) {
            return files.filter((file) => file.filename !== "sse_stream.rs");
        }
        return files;
    }

    public getSubpackageOrThrow(subpackageId: FernIr.SubpackageId): FernIr.Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`FernIr.Subpackage with id ${subpackageId} not found`);
        }
        return subpackage;
    }

    public getHttpServiceOrThrow(serviceId: FernIr.ServiceId): FernIr.HttpService {
        const service = this.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Service with id ${serviceId} not found`);
        }
        return service;
    }

    public getSubpackagesOrThrow(packageOrSubpackage: FernIr.Package | FernIr.Subpackage): [string, FernIr.Subpackage][] {
        return packageOrSubpackage.subpackages.map((subpackageId) => {
            return [subpackageId, this.getSubpackageOrThrow(subpackageId)];
        });
    }

    public getDirectoryForFernFilepath(fernFilepath: FernIr.FernFilepath): string {
        return fernFilepath.allParts.map((path) => path.snakeCase.safeName).join("/");
    }

    public toModelGeneratorContext(): ModelGeneratorContext {
        return new ModelGeneratorContext(
            this.ir,
            this.config,
            ModelCustomConfigSchema.parse({
                // Convert SDK config to model config - use centralized configuration manager
                crateName: this.getCrateName(),
                crateVersion: this.getCrateVersion(),
                extraDependencies: this.getExtraDependencies(),
                extraDevDependencies: this.getExtraDevDependencies(),
                generateBuilders: false,
                deriveDebug: true,
                deriveClone: true,
                dateTimeType: this.customConfig.dateTimeType ?? "utc"
            }),
            this.generatorNotificationService
        );
    }
}
