import { camelCase } from "lodash-es";

import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options,
    TypeInstance
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseJavaCustomConfigSchema, java } from "@fern-api/java-ast";

import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

const RESERVED_NAMES = new Set([
    "enum",
    "extends",
    "package",
    "void",
    "short",
    "class",
    "abstract",
    "return",
    "import",
    "for",
    "assert",
    "switch",
    "getClass"

    // TODO(amckinney): The Java SDK generator currently supports "object" as a reserved name, but it
    // doesn't need to be. We should update the Java generator so that we don't need to include this here.
]);

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseJavaCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
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
        this.customConfig =
            config.customConfig != null ? (config.customConfig as BaseJavaCustomConfigSchema) : undefined;
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config,
            options: this.options
        });
    }

    public getClassName(name: FernIr.Name): string {
        return this.getName(name.pascalCase.safeName);
    }

    public getEnumName(name: FernIr.Name): string {
        return this.getName(name.screamingSnakeCase.safeName);
    }

    public getPropertyName(name: FernIr.Name): string {
        return this.getName(name.camelCase.safeName);
    }

    public getMethodName(name: FernIr.Name): string {
        return this.getName(name.camelCase.safeName);
    }

    public getRootClientClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getRootClientClassName(),
            packageName: this.getRootPackageName()
        });
    }

    public getRootClientClassName(): string {
        return this.customConfig?.["client-class-name"] ?? `${this.getBaseNamePrefix()}Client`;
    }

    public getEnvironmentClassName(): string {
        return "Environment";
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): java.ClassReference | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return this.getEnvironmentClassReferenceForEnumName(environmentName);
    }

    public getEnvironmentClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getEnvironmentClassName(),
            packageName: this.getCorePackageName()
        });
    }

    private getEnvironmentClassReferenceForEnumName(name: FernIr.Name): java.ClassReference {
        return java.classReference({
            name: `${this.getEnvironmentClassName()}.${this.getEnumName(name)}`,
            packageName: this.getCorePackageName()
        });
    }

    public getJavaClassReferenceFromDeclaration({
        declaration
    }: {
        declaration: FernIr.dynamic.Declaration;
    }): java.ClassReference {
        return java.classReference({
            name: declaration.name.pascalCase.unsafeName,
            packageName: this.getTypesPackageName(declaration.fernFilepath)
        });
    }

    public getNullableClassReference(): java.ClassReference {
        return java.classReference({
            name: "Nullable",
            packageName: this.getCorePackageName()
        });
    }

    public getNullableOfNull(): java.TypeLiteral {
        return java.TypeLiteral.reference(
            java.invokeMethod({
                on: this.getNullableClassReference(),
                method: "ofNull",
                arguments_: []
            })
        );
    }

    public getFileStreamFromString(content: string): java.TypeLiteral {
        return java.TypeLiteral.reference(
            java.codeblock((writer) => {
                writer.write("new ");
                writer.writeNode(this.getFileStreamClassReference());
                writer.write("(");
                writer.writeNode(this.getByteArrayInputStreamClassReference());
                writer.write("(");
                writer.writeNode(java.TypeLiteral.string(content));
                writer.write(".getBytes(");
                writer.writeNode(this.getStandardCharsetsClassReference());
                writer.write(".UTF_8)))");
            })
        );
    }

    public getFileStreamClassReference(): java.ClassReference {
        return java.classReference({
            name: "FileStream",
            packageName: this.getCorePackageName()
        });
    }

    public getByteArrayInputStreamClassReference(): java.ClassReference {
        return java.classReference({
            name: "ByteArrayInputStream",
            packageName: "java.io"
        });
    }

    public getStandardCharsetsClassReference(): java.ClassReference {
        return java.classReference({
            name: "StandardCharsets",
            packageName: "java.nio.charset"
        });
    }

    public isPrimitive(typeReference: FernIr.dynamic.TypeReference): boolean {
        switch (typeReference.type) {
            case "primitive":
                return true;
            case "optional":
            case "nullable":
                return this.isPrimitive(typeReference.value);
            case "named": {
                const named = this.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return false;
                }
                switch (named.type) {
                    case "alias":
                        return this.isPrimitive(named.typeReference);
                    case "discriminatedUnion":
                    case "undiscriminatedUnion":
                    case "object":
                    case "enum":
                        return false;
                    default:
                        assertNever(named);
                }
                break;
            }
            case "list":
            case "set":
            case "map":
            case "literal":
            case "unknown":
                return false;
            default:
                assertNever(typeReference);
        }
    }

    public getRootPackageName(): string {
        const tokens = this.getPackagePrefixTokens();
        return this.joinPackageTokens(tokens);
    }

    public getCorePackageName(): string {
        const tokens = this.getPackagePrefixTokens();
        tokens.push("core");
        return this.joinPackageTokens(tokens);
    }

    public getTypesPackageName(fernFilepath: FernIr.FernFilepath): string {
        return this.getResourcesPackage(fernFilepath, "types");
    }

    public getRequestsPackageName(fernFilepath: FernIr.FernFilepath): string {
        if (this.getPackageLayout() === "flat") {
            return this.getTypesPackageName(fernFilepath);
        }
        return this.getResourcesPackage(fernFilepath, "requests");
    }

    protected getResourcesPackage(fernFilepath: FernIr.FernFilepath, suffix?: string): string {
        const tokens = this.getPackagePrefixTokens();
        switch (this.getPackageLayout()) {
            case "flat":
                if (fernFilepath != null) {
                    tokens.push(...fernFilepath.packagePath.map((name) => this.getPackageNameSegment(name)));
                }
                break;
            case "nested":
            default:
                if (fernFilepath != null && fernFilepath.allParts.length > 0) {
                    tokens.push("resources");
                }
                if (fernFilepath != null) {
                    tokens.push(...fernFilepath.allParts.map((name) => this.getPackageNameSegment(name)));
                }
        }
        if (suffix != null) {
            tokens.push(suffix);
        }
        return this.joinPackageTokens(tokens);
    }

    public getPackageName(fernFilepath: FernIr.FernFilepath, suffix?: string): string {
        let parts = this.getPackageNameSegments(fernFilepath);
        parts = suffix != null ? [...parts, suffix] : parts;
        return [...this.getPackagePrefixTokens(), ...parts].join(".");
    }

    public getPackageLayout(): string {
        return this.customConfig?.["package-layout"] ?? "nested";
    }

    public shouldInlinePathParameters(): boolean {
        return this.customConfig?.["inline-path-parameters"] ?? false;
    }

    public shouldInlineFileProperties(): boolean {
        return this.customConfig?.["inline-file-properties"] ?? false;
    }

    private getPackageNameSegments(fernFilepath: FernIr.FernFilepath): string[] {
        return fernFilepath.packagePath.map((segment) => this.getPackageNameSegment(segment));
    }

    private getPackageNameSegment(name: FernIr.Name): string {
        return name.camelCase.safeName.toLowerCase();
    }

    private getPackagePrefixTokens(): string[] {
        if (this.customConfig?.["package-prefix"] != null) {
            return this.customConfig["package-prefix"].split(".");
        }
        const prefix: string[] = [];
        prefix.push("com");
        prefix.push(...this.splitOnNonAlphaNumericChar(this.config.organization));
        prefix.push(...this.splitOnNonAlphaNumericChar(this.getApiName()));
        return prefix;
    }

    private getBaseNamePrefix(): string {
        return (
            this.convertKebabCaseToUpperCamelCase(this.config.organization) +
            this.convertKebabCaseToUpperCamelCase(this.getApiName())
        );
    }

    private getApiName(): string {
        return camelCase(this.config.workspaceName);
    }

    private startsWithNumber(token: string): boolean {
        return /^\d/.test(token);
    }

    private splitOnNonAlphaNumericChar(value: string): string[] {
        return value.split(/[^a-zA-Z0-9]/);
    }

    private convertKebabCaseToUpperCamelCase(kebab: string): string {
        return kebab.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase());
    }

    private joinPackageTokens(tokens: string[]): string {
        const sanitizedTokens = tokens.map((token) => {
            return this.startsWithNumber(token) ? "_" + token : token;
        });
        return sanitizedTokens.join(".");
    }

    private getName(name: string): string {
        if (this.isReservedName(name)) {
            return "_" + name;
        }
        return name;
    }

    private isReservedName(name: string): boolean {
        return RESERVED_NAMES.has(name);
    }
}
