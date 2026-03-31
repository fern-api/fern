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

    public hasEnvironments(): boolean {
        return this.ir.environments?.environments != null;
    }

    public hasMultipleBaseUrls(): boolean {
        return this.ir.environments?.environments?.type === "multipleBaseUrls";
    }

    public getEnvironmentEnumName(): string {
        return this.customConfig.environmentEnumName || "Environment";
    }

    public getCoreAsIsFiles(): AsIsFileDefinition[] {
        let files = Object.values(AsIsFiles);
        // Exclude core/mod.rs — it's generated dynamically to only declare modules for files that exist.
        // The static asIs mod.rs always declares mod sse_stream and mod websocket, which breaks
        // cargo fmt when those files are conditionally excluded (cargo fmt doesn't evaluate #[cfg]).
        files = files.filter((file) => file !== AsIsFiles.CoreMod);
        files = files.filter((file) => file.filename !== "client.rs");
        // Only include sse_stream.rs when there are streaming endpoints
        if (!this.hasStreamingEndpoints()) {
            files = files.filter((file) => file.filename !== "sse_stream.rs");
        }
        // Only include websocket.rs when there are WebSocket channels
        if (!this.hasWebSocketChannels()) {
            files = files.filter((file) => file.filename !== "websocket.rs");
        }
        // Only include bigint_string.rs when big integer types are used
        if (!this.usesBigInteger()) {
            files = files.filter((file) => file.filename !== "bigint_string.rs");
        }
        // Only include base64_bytes.rs when base64 types are used
        if (!this.usesBase64()) {
            files = files.filter((file) => file.filename !== "base64_bytes.rs");
        }
        // Only include number_serializers.rs when floating point types are used
        if (!this.usesFloatingPoint()) {
            files = files.filter((file) => file.filename !== "number_serializers.rs");
        }
        // Only include flexible_datetime.rs when datetime/date types are used
        if (!this.usesDateTime()) {
            files = files.filter((file) => file.filename !== "flexible_datetime.rs");
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
        const modelContext = new ModelGeneratorContext(
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

        // Pass WebSocket server message type IDs so StructGenerator can skip
        // the `type` property on those structs (conflicts with #[serde(tag = "type")])
        if (this.hasWebSocketChannels()) {
            modelContext.websocketServerMessageTypeIds = this.computeWebSocketServerMessageTypeIds();
        }

        return modelContext;
    }

    /**
     * Returns true if the subpackage has only a WebSocket channel and no HTTP service
     * or endpoints in tree. These subpackages should not generate HTTP client stubs
     * since the actual WebSocket functionality is handled by the WebSocketChannelGenerator.
     */
    public isWebSocketOnlySubpackage(subpackage: FernIr.Subpackage): boolean {
        return subpackage.websocket != null && subpackage.service == null && !subpackage.hasEndpointsInTree;
    }

    /**
     * Scans all WebSocket channels and collects type IDs from server messages
     * that have named body types. These types are used as variants in a
     * `#[serde(tag = "type")]` enum, so their inner `type` property must be
     * skipped to avoid deserialization conflicts.
     */
    private computeWebSocketServerMessageTypeIds(): Set<string> {
        const typeIds = new Set<string>();
        const websocketChannels = this.ir.websocketChannels;
        if (!websocketChannels) {
            return typeIds;
        }

        for (const channel of Object.values(websocketChannels)) {
            for (const msg of channel.messages) {
                if (msg.origin !== "server") {
                    continue;
                }
                if (msg.body.type === "reference" && msg.body.bodyType.type === "named") {
                    typeIds.add(msg.body.bodyType.typeId);
                }
            }
        }

        return typeIds;
    }
}
