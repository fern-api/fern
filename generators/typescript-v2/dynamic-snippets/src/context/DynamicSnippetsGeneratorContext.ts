import { assertNever } from "@fern-api/core-utils";
import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { BaseTypescriptCustomConfigSchema, resolveRootImportPath } from "@fern-api/typescript-ast";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { ts } from "@fern-api/typescript-ast";
import { FilePropertyMapper } from "./FilePropertyMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseTypescriptCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;
    public rootImportPath: string;

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
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
        this.rootImportPath = resolveRootImportPath({ config, customConfig: this.customConfig });
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

    private includeRequestBodyInWrappedRequest({ body }: { body: FernIr.dynamic.InlinedRequestBody }): boolean {
        return false;
    }

    private includeFileUploadBodyInWrappedRequest({
        fileUpload
    }: {
        fileUpload: FernIr.dynamic.FileUploadRequestBody;
    }): boolean {
        return false;
    }

    public getMethodName(name: FernIr.Name): string {
        return name.pascalCase.unsafeName;
    }

    public getTypeName(name: FernIr.Name): string {
        return name.pascalCase.unsafeName;
    }

    public getImportPath(fernFilepath: FernIr.FernFilepath): string {
        const parts = fernFilepath.packagePath.map((path) => path.pascalCase.unsafeName.toLowerCase());
        return [this.rootImportPath, ...parts].join("/");
    }

    public getContextTypeReference(): ts.Reference {
        return ts.reference({
            name: "Context"
        });
    }

    public getContextTodoFunctionInvocation(): ts.FunctionInvocation {
        return ts.invokeFunction({
            func: ts.reference({
                name: "TODO"
            }),
            arguments_: []
        });
    }

    public getIoReaderTypeReference(): ts.Reference {
        return ts.reference({
            name: "TODO-file-reader"
        });
        /*
        import * as fs from 'fs';

        function readFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
            });
        });
        }
        */
        // TODO: Implement
    }

    public getNewStringsReaderFunctionInvocation(s: string): ts.FunctionInvocation {
        // TODO: Implement
        return ts.invokeFunction({
            func: ts.reference({
                name: "TODO-file-reader"
            }),
            arguments_: [ts.TypeLiteral.string(s)]
        });
    }

    public getClientConstructorName(): string {
        if (this.customConfig?.exportedClientName != null) {
            return `New${this.customConfig.exportedClientName}`;
        }
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
