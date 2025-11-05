import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseGoCustomConfigSchema, go, resolveRootImportPath } from "@fern-api/go-ast";

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

    public isOptional(typeReference: FernIr.dynamic.TypeReference): boolean {
        switch (typeReference.type) {
            case "optional":
            case "map":
                return true;
            case "nullable":
            case "list":
            case "set":
                return this.isOptional(typeReference.value);
            case "named":
            case "literal":
            case "primitive":
            case "unknown":
                return false;
            default:
                assertNever(typeReference);
        }
    }

    public getMethodName(name: FernIr.Name): string {
        return name.pascalCase.unsafeName;
    }

    public getTestMethodName(endpoint: FernIr.dynamic.Endpoint): string {
        return (
            endpoint.declaration.fernFilepath.allParts.map((name) => name.pascalCase.unsafeName).join("") +
            endpoint.declaration.name.pascalCase.unsafeName
        );
    }

    public getTypeName(name: FernIr.Name): string {
        return name.pascalCase.unsafeName;
    }

    public getImportPath(fernFilepath: FernIr.dynamic.FernFilepath): string {
        const parts = fernFilepath.packagePath.map((path) => path.pascalCase.unsafeName.toLowerCase());
        return [this.rootImportPath, ...parts].join("/");
    }

    public getImportPathForRequest(fernFilepath: FernIr.dynamic.FernFilepath): string {
        if (this.customConfig?.exportAllRequestsAtRoot) {
            return this.rootImportPath;
        }
        return this.getImportPath(fernFilepath);
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

    public getTestingTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "T",
            importPath: "testing"
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
        if (this.customConfig?.clientConstructorName != null) {
            return this.customConfig.clientConstructorName;
        }
        if (this.customConfig?.exportedClientName != null) {
            return `New${this.customConfig.exportedClientName}`;
        }
        return `New${this.getClientName()}`;
    }

    public getClientName(): string {
        if (this.customConfig?.clientName != null) {
            return this.customConfig.clientName;
        }
        return "Client";
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
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return this.getEnvironmentTypeReference(environmentName);
    }

    private getEnvironmentTypeReference(name: FernIr.Name): go.TypeReference {
        return go.typeReference({
            name: `Environments.${this.getTypeName(name)}`,
            importPath: this.rootImportPath
        });
    }

    public static chainMethods(
        baseFunc: go.FuncInvocation,
        ...methods: Omit<go.MethodInvocation.Args, "on">[]
    ): go.MethodInvocation {
        if (methods.length === 0) {
            throw new Error("Must have methods to chain");
        }

        let current: go.AstNode = baseFunc;
        for (const method of methods) {
            current = go.invokeMethod({
                on: current,
                method: method.method,
                arguments_: method.arguments_,
                multiline: method.multiline
            });
        }
        return current as go.MethodInvocation;
    }
}
