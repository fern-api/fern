import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import {
    convertToPascalCase,
    convertToSnakeCase,
    escapeRustKeyword,
    generateDefaultCrateName,
    getName,
    validateAndSanitizeCrateName
} from "@fern-api/rust-base";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { DynamicTypeInstantiationMapper } from "./DynamicTypeInstantiationMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseRustCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeInstantiationMapper: DynamicTypeInstantiationMapper;
    public filePropertyMapper: FilePropertyMapper;

    constructor({
        ir,
        config,
        options
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        options?: Options;
    }) {
        super({ ir, config, options });
        this.ir = ir;
        this.customConfig = config.customConfig as BaseRustCustomConfigSchema | undefined;
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeInstantiationMapper = new DynamicTypeInstantiationMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config,
            options: this.options
        });
    }

    public getStructName(name: FernIr.Name): string {
        return getName(name.pascalCase.safeName);
    }

    public getEnumName(name: FernIr.Name): string {
        return getName(name.pascalCase.safeName);
    }

    public getPropertyName(name: FernIr.Name): string {
        // For struct fields, use raw identifier syntax for reserved keywords
        const input = name.snakeCase.safeName;
        // If the field name ends with "_", check if it's a Rust keyword that was escaped
        // Convert it back to raw identifier syntax (e.g., "type_" -> "r#type")
        if (input.endsWith("_")) {
            const baseKeyword = input.slice(0, -1); // Remove the trailing "_"
            return escapeRustKeyword(baseKeyword);
        }

        return escapeRustKeyword(input);
    }

    public getMethodName(name: FernIr.Name): string {
        return getName(name.snakeCase.safeName);
    }

    /**
     * Get the crate name with fallback to generated default
     */
    public getCrateName(): string {
        const orgName = this.config.organization;
        const workspaceName = this.config.workspaceName;

        let createName = this.customConfig?.crateName ?? generateDefaultCrateName(orgName, workspaceName);
        return validateAndSanitizeCrateName(createName);
    }

    // Client methods
    public getClientStructName(): string {
        return this.customConfig?.clientClassName ?? `${convertToPascalCase(this.config.workspaceName)}Client`;
    }

    // Module and path methods
    public getModulePath(fernFilepath: FernIr.FernFilepath): string {
        const parts = fernFilepath.packagePath.map((path) => convertToSnakeCase(path.pascalCase.safeName));
        return parts.join("::");
    }

    // Environment resolution stub
    public resolveEnvironmentName(environmentID: string): FernIr.Name | undefined {
        return undefined; // TODO: Implement proper environment resolution
    }
}
