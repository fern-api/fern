import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseGoCustomConfigSchema, resolveRootImportPath } from "@fern-api/go-ast";
import { go } from "@fern-api/go-ast";

import { DynamicTypeInstantiationMapper } from "./DynamicTypeInstantiationMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseGoCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeInstantiationMapper: DynamicTypeInstantiationMapper;
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
        this.customConfig = config.customConfig != null ? (config.customConfig as BaseGoCustomConfigSchema) : undefined;
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeInstantiationMapper = new DynamicTypeInstantiationMapper({ context: this });
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
        if (this.includePathParametersInWrappedRequest({ request })) {
            return true;
        }
        if (request.queryParameters != null && request.queryParameters.length > 0) {
            return true;
        }
        if (request.headers != null && request.headers.length > 0) {
            return true;
        }
        if (request.body != null) {
            return this.includeRequestBodyInWrappedRequest({ body: request.body });
        }
        if (request.metadata?.onlyPathParameters) {
            return false;
        }
        return true;
    }

    public includePathParametersInWrappedRequest({ request }: { request: FernIr.dynamic.InlinedRequest }): boolean {
        return (this.customConfig?.inlinePathParameters ?? false) && (request.metadata?.includePathParameters ?? false);
    }

    private includeRequestBodyInWrappedRequest({ body }: { body: FernIr.dynamic.InlinedRequestBody }): boolean {
        switch (body.type) {
            case "properties":
            case "referenced":
                return true;
            case "fileUpload":
                return this.includeFileUploadBodyInWrappedRequest({ fileUpload: body });
            default:
                assertNever(body);
        }
    }

    private includeFileUploadBodyInWrappedRequest({
        fileUpload
    }: {
        fileUpload: FernIr.dynamic.FileUploadRequestBody;
    }): boolean {
        return (
            this.fileUploadHasBodyProperties({ fileUpload }) ||
            ((this.customConfig?.inlineFileProperties ?? false) && this.fileUploadHasFileProperties({ fileUpload }))
        );
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

    public getContextTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "Context",
            importPath: "context"
        });
    }

    public getContextTodoFunctionInvocation(): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: "TODO",
                importPath: "context"
            }),
            arguments_: []
        });
    }

    public getIoReaderTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "Reader",
            importPath: "io"
        });
    }

    public getNewStringsReaderFunctionInvocation(s: string): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: "NewReader",
                importPath: "strings"
            }),
            arguments_: [go.TypeInstantiation.string(s)]
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

    public getOptionImportPath(): string {
        return `${this.rootImportPath}/option`;
    }

    public getGoTypeReferenceFromDeclaration({
        declaration
    }: {
        declaration: FernIr.dynamic.Declaration;
    }): go.TypeReference {
        return go.typeReference({
            name: declaration.name.pascalCase.unsafeName,
            importPath: this.getImportPath(declaration.fernFilepath)
        });
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): go.TypeReference | undefined {
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

    private getEnvironmentTypeReference(name: FernIr.Name): go.TypeReference {
        return go.typeReference({
            name: `Environments.${this.getTypeName(name)}`,
            importPath: this.rootImportPath
        });
    }
}
