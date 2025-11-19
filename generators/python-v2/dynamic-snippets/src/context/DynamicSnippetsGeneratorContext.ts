import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { python } from "@fern-api/python-ast";
import { BasePythonCustomConfigSchema } from "@fern-api/python-browser-compatible-base";
import { camelCase, snakeCase } from "lodash-es";

import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

const ALLOWED_RESERVED_METHOD_NAMES = ["list", "set"];

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BasePythonCustomConfigSchema;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;

    constructor({
        ir,
        config
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super({ ir, config });
        this.ir = ir;
        this.customConfig = (config.customConfig ?? {}) as BasePythonCustomConfigSchema;
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config
        });
    }

    public getClassName(name: FernIr.Name): string {
        const result = name.pascalCase.safeName;
        const rootClientName = this.getRootClientClassName();
        if (result === rootClientName) {
            return `${rootClientName}Model`;
        }
        return result;
    }

    public getTypedDictClassName(name: FernIr.Name): string {
        return `${this.getClassName(name)}Params`;
    }

    public getPropertyName(name: FernIr.Name): string {
        const snakeCase = name.snakeCase.safeName;
        if (snakeCase.startsWith("_")) {
            // These are public fields so they should not start with an underscore.
            //
            // The Fern CLI will automatically add the underscore in the beginning for
            // fields that start with a number so we actually expect some public fields
            // to start with an underscore that we need to strip.
            //
            // This isn't just nice to have, Pydantic V2 also disallows underscore prefixes
            // and Python also does not allow fields to start with a number, so we need a
            // new prefix.
            return "f_" + snakeCase.substring(snakeCase.lastIndexOf("_") + 1);
        }
        return snakeCase;
    }

    public getMethodName(name: FernIr.Name): string {
        if (ALLOWED_RESERVED_METHOD_NAMES.includes(name.snakeCase.unsafeName)) {
            return name.snakeCase.unsafeName;
        }
        return name.snakeCase.safeName;
    }

    public getRootClientClassReference(): python.Reference {
        return python.reference({
            name: this.getRootClientClassName(),
            modulePath: this.getRootModulePath()
        });
    }

    public getRootClientClassName(): string {
        if (this.customConfig.client?.exported_class_name != null) {
            return this.customConfig.client.exported_class_name;
        }
        if (this.customConfig.client_class_name != null) {
            return this.customConfig.client_class_name;
        }
        if (this.customConfig.client?.class_name != null) {
            return this.customConfig.client.class_name;
        }
        return this.pascalCase(this.config.organization) + this.pascalCase(this.config.workspaceName);
    }

    public getEnvironmentClassName(): string {
        return `${this.getRootClientClassName()}Environment`;
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): python.AstNode | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return python.accessAttribute({
            lhs: this.getEnvironmentClassReference(),
            rhs: python.codeBlock(this.getEnvironmentEnumName(environmentName))
        });
    }

    public getEnvironmentClassReference(): python.Reference {
        return python.reference({
            name: this.getEnvironmentClassName(),
            modulePath: this.getEnvironmentModulePath()
        });
    }

    public getEnvironmentEnumName(name: FernIr.Name): string {
        return name.screamingSnakeCase.safeName;
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

    public getFileFromString(content: string): python.TypeInstantiation {
        return python.TypeInstantiation.str(content);
    }

    public getRootModulePath(): string[] {
        if (this.customConfig.package_name != null) {
            return [this.customConfig.package_name];
        }
        const cleanOrganizationName = this.cleanOrganizationName();
        if (this.customConfig.use_api_name_in_package) {
            return [cleanOrganizationName, this.getApiName()];
        }
        return [cleanOrganizationName];
    }

    public getCoreModulePath(): string[] {
        return this.getRootModulePath().concat("core");
    }

    public getEnvironmentModulePath(): string[] {
        return this.getRootModulePath().concat("environment");
    }

    public shouldInlinePathParameters(): boolean {
        // TODO: Update this when inline_path_parameters is supported.
        return true;
    }

    public hasMultipleBaseUrlEnvironments(): boolean {
        if (this.ir.environments == null) {
            return false;
        }
        return this.ir.environments.environments.type === "multipleBaseUrls";
    }

    public getDefaultEnvironmentId(): string | undefined {
        return this.ir.environments?.defaultEnvironment;
    }

    private cleanOrganizationName(): string {
        return this.config.organization.replace(/[^a-zA-Z0-9]/g, "_");
    }

    private getApiName(): string {
        return snakeCase(this.config.workspaceName);
    }

    private pascalCase(name: string): string {
        const value = camelCase(name);
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}
