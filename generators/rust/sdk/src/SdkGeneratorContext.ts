import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRustGeneratorContext, AsIsFileDefinition, AsIsFiles } from "@fern-api/rust-base";
import { ModelCustomConfigSchema, ModelGeneratorContext } from "@fern-api/rust-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    FernFilepath,
    HttpService,
    IntermediateRepresentation,
    Package,
    ServiceId,
    Subpackage,
    SubpackageId
} from "@fern-fern/ir-sdk/api";
import { RustGeneratorAgent } from "./RustGeneratorAgent";
import { ReadmeConfigBuilder } from "./readme";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export class SdkGeneratorContext extends AbstractRustGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: RustGeneratorAgent;

    constructor(
        ir: IntermediateRepresentation,
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
        return Object.values(AsIsFiles);
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`Subpackage with id ${subpackageId} not found`);
        }
        return subpackage;
    }

    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        const service = this.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Service with id ${serviceId} not found`);
        }
        return service;
    }

    public getSubpackagesOrThrow(packageOrSubpackage: Package | Subpackage): [string, Subpackage][] {
        return packageOrSubpackage.subpackages.map((subpackageId) => {
            return [subpackageId, this.getSubpackageOrThrow(subpackageId)];
        });
    }

    public getDirectoryForFernFilepath(fernFilepath: FernFilepath): string {
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
                deriveClone: true
            }),
            this.generatorNotificationService
        );
    }
}
