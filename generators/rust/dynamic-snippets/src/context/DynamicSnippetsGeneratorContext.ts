import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseRustCustomConfigSchema, rust } from "@fern-api/rust-codegen";
import { camelCase, snakeCase } from "lodash-es";
import { DynamicTypeInstantiationMapper } from "./DynamicTypeInstantiationMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

const RESERVED_NAMES = new Set([
    "as",
    "break",
    "const",
    "continue",
    "crate",
    "else",
    "enum",
    "extern",
    "false",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "match",
    "mod",
    "move",
    "mut",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "type",
    "unsafe",
    "use",
    "where",
    "while"
]);

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
        return this.getName(name.pascalCase.safeName);
    }

    public getEnumName(name: FernIr.Name): string {
        return this.getName(name.pascalCase.safeName);
    }

    public getPropertyName(name: FernIr.Name): string {
        return this.getName(name.snakeCase.safeName);
    }

    public getMethodName(name: FernIr.Name): string {
        return this.getName(name.snakeCase.safeName);
    }

    public getVariableName(name: FernIr.Name): string {
        return this.getName(name.snakeCase.safeName);
    }

    public getCrateName(): string {
        // Generate default package name from organization and workspace name to match SDK generator

        if (this.customConfig?.crateName) {
            return this.customConfig.crateName;
        }

        const orgName = this.config.organization;
        const workspaceName = this.config.workspaceName;

        if (orgName && workspaceName) {
            return `${orgName}_${workspaceName}`.toLowerCase().replace(/-/g, "_");
        }

        // Try to get it from workspace name only, converting hyphens to underscores for Rust
        if (workspaceName) {
            return workspaceName.replace(/-/g, "_");
        }

        // Fallback to "api" - this should be improved once we have access to the actual API name
        return "api";
    }

    public hasAuth(): boolean {
        return false; // TODO: Implement proper auth resolution
    }

    private getName(name: string): string {
        if (RESERVED_NAMES.has(name)) {
            return `${name}_`;
        }
        return name;
    }

    public convertToSnakeCase(str: string): string {
        return snakeCase(str);
    }

    public convertToCamelCase(str: string): string {
        return camelCase(str);
    }

    public convertToPascalCase(str: string): string {
        return str.charAt(0).toUpperCase() + camelCase(str).slice(1);
    }

    // Client methods
    public getClientStructName(): string {
        return this.customConfig?.clientClassName ?? `${this.convertToPascalCase(this.config.workspaceName)}Client `;
    }

    // Module and path methods
    public getModulePath(fernFilepath: FernIr.FernFilepath): string {
        const parts = fernFilepath.packagePath.map((path) => this.convertToSnakeCase(path.pascalCase.safeName));
        return parts.join("::");
    }

    // Type reference methods
    public getRustTypeReferenceFromDeclaration({
        declaration
    }: {
        declaration: FernIr.dynamic.Declaration;
    }): rust.Reference {
        return rust.reference({
            name: this.getStructName(declaration.name),
            module: this.getModulePath(declaration.fernFilepath)
        });
    }

    // Helper methods for common Rust expressions
    public getOptionSomeExpression(value: rust.Expression): rust.Expression {
        return rust.Expression.some(value);
    }

    public getOptionNoneExpression(): rust.Expression {
        return rust.Expression.reference("None");
    }

    public getVecMacroExpression(elements: rust.Expression[]): rust.Expression {
        return rust.Expression.vec(elements);
    }

    // Environment resolution stub
    public resolveEnvironmentName(environmentID: string): FernIr.Name | undefined {
        return undefined; // TODO: Implement proper environment resolution
    }
}
