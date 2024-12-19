import { assertNever } from "@fern-api/core-utils";
import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { BaseTypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { ts } from "@fern-api/typescript-ast";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseTypescriptCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public rootImportPath = ".";

    constructor({
        ir,
        config
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super({ ir, config });
        this.ir = ir;
        this.customConfig =
            config.customConfig != null ? (config.customConfig as BaseTypescriptCustomConfigSchema) : undefined;
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config
        });
    }

    public needsRequestParameter({ request }: { request: FernIr.dynamic.InlinedRequest }): boolean {
        return false;
    }

    public includePathParametersInWrappedRequest({ request }: { request: FernIr.dynamic.InlinedRequest }): boolean {
        return false;
    }

    public getMethodName(name: FernIr.Name): string {
        return name.pascalCase.unsafeName;
    }

    public getTypeName(name: FernIr.Name): string {
        return name.pascalCase.unsafeName;
    }

    public getPathParameterName(name: FernIr.Name): string {
        return name.originalName;
    }

    public getImportPath(fernFilepath: FernIr.FernFilepath): string {
        return fernFilepath.packagePath.map((path) => path.pascalCase.unsafeName.toLowerCase()).join("/");
    }

    public getContextTypeReference(): ts.Reference {
        return ts.reference({
            name: "Context"
        });
    }

    public getContextTodoFunctionInvocation(): ts.FunctionInvocation {
        return ts.invokeFunction({
            function_: ts.reference({
                name: "TODO"
            }),
            arguments_: []
        });
    }

    public getIoReaderTypeReference(): ts.Reference {
        return ts.reference({
            name: "TODO-file-reader"
        });
    }

    public getNewStringsReaderFunctionInvocation(s: string): ts.FunctionInvocation {
        // TODO: Implement
        return ts.invokeFunction({
            function_: ts.reference({
                name: "TODO-file-reader"
            }),
            arguments_: [ts.TypeLiteral.string(s)]
        });
    }

    public getClientConstructorName(): string {
        return "NewClient";
    }

    public getClientImportPath(): string {
        return `${this.rootImportPath}/client`;
    }

    public getTypeReferenceFromDeclaration({ declaration }: { declaration: FernIr.dynamic.Declaration }): ts.Reference {
        return ts.reference({
            name: declaration.name.pascalCase.unsafeName
            // importFrom: this.getImportPath(declaration.fernFilepath) // TODO: Implement import handling
        });
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): ts.Reference | undefined {
        if (this.ir.environments == null) {
            return undefined;
        }
        const environments = this.ir.environments.environments;
        switch (environments.type) {
            case "singleBaseUrl": {
                const environment = environments.environments.find((env) => env.id === environmentID);
                if (environment == null) {
                    return undefined;
                }
                return this.getEnvironmentTypeReference(environment.name);
            }
            case "multipleBaseUrls": {
                const environment = environments.environments.find((env) => env.id === environmentID);
                if (environment == null) {
                    return undefined;
                }
                return this.getEnvironmentTypeReference(environment.name);
            }
            default:
                assertNever(environments);
        }
    }

    public getEnvironmentTypeReference(name: FernIr.Name): ts.Reference {
        return new ts.Reference({
            name: `Environments.${this.getTypeName(name)}`
            // importPath: this.rootImportPath
        });
    }
}
