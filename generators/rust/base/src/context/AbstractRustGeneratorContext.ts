import {
    AbstractGeneratorContext,
    AbstractGeneratorNotificationService,
    GeneratorNotificationService
} from "@fern-api/base-generator";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { BaseRustCustomConfigSchema } from "../custom-config";
import { RustProject } from "../project/RustProject";
import { RUST_KEYWORDS, RUST_RESERVED_TYPES } from "../constants";

export abstract class AbstractRustGeneratorContext<
    CustomConfig extends BaseRustCustomConfigSchema = BaseRustCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: RustProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new RustProject({
            context: this,
            packageName: this.getPackageName(),
            packageVersion: this.getPackageVersion()
        });
    }

    public getPackageName(): string {
        return this.customConfig.packageName ?? this.ir.apiName.snakeCase.safeName;
    }

    public getPackageVersion(): string {
        return this.customConfig.packageVersion ?? "0.1.0";
    }

    public isReservedKeyword(name: string): boolean {
        return RUST_KEYWORDS.has(name) || RUST_RESERVED_TYPES.has(name);
    }

    public makeNameSafe(name: string): string {
        if (this.isReservedKeyword(name)) {
            return `${name}_`;
        }
        return name;
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }
} 