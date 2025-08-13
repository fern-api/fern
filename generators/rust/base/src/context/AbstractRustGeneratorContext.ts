import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { AsIsFileDefinition } from "../AsIs";
import { BaseRustCustomConfigSchema, RustConfigurationManager } from "../config";
import { RustProject } from "../project";

export abstract class AbstractRustGeneratorContext<
    CustomConfig extends BaseRustCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: RustProject;
    public readonly configManager: RustConfigurationManager<CustomConfig>;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.configManager = new RustConfigurationManager(customConfig, this);
        this.project = new RustProject({
            context: this,
            packageName: this.configManager.getPackageName(),
            packageVersion: this.configManager.getPackageVersion()
        });
    }

    /**
     * Escapes Rust keywords by prefixing them with 'r#'
     * @deprecated Use configManager.escapeRustKeyword() instead
     */
    public escapeRustKeyword(name: string): string {
        return this.configManager.escapeRustKeyword(name);
    }

    /**
     * Escapes Rust reserved types by prefixing them with 'r#'
     * @deprecated Use configManager.escapeRustReservedType() instead
     */
    public escapeRustReservedType(name: string): string {
        return this.configManager.escapeRustReservedType(name);
    }

    /**
     * Get the core AsIs template files for this generator type
     */
    public abstract getCoreAsIsFiles(): AsIsFileDefinition[];
}
