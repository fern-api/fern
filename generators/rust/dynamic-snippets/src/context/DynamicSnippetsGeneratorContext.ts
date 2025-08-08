import { snakeCase, camelCase } from "lodash-es";

import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { rust } from "@fern-api/rust-codegen";

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

interface RustCustomConfigSchema {
    packageName?: string;
    crateName?: string;
    clientName?: string;
    clientBuilderName?: string;
}

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: RustCustomConfigSchema | undefined;
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
        this.customConfig = config.customConfig as RustCustomConfigSchema | undefined;
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

    public getPackageName(): string {
        return this.customConfig?.packageName ?? "api";
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

    // Package and crate methods
    public getCrateName(): string {
        return this.customConfig?.crateName ?? this.getPackageName();
    }

    // Client methods
    public getClientStructName(): string {
        return this.customConfig?.clientName ?? "Client";
    }

    public getClientBuilderName(): string {
        return this.customConfig?.clientBuilderName ?? `${this.getClientStructName()}Builder`;
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
