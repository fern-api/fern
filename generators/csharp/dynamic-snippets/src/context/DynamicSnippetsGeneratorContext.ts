import { camelCase, upperFirst } from "lodash-es";

import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { BaseCsharpCustomConfigSchema, csharp } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";

const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";
const REQUEST_OPTIONS_CLASS_NAME = "RequestOptions";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseCsharpCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public rootNamespace: string;

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
            config.customConfig != null ? (config.customConfig as BaseCsharpCustomConfigSchema) : undefined;
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.rootNamespace = getRootNamespace({
            organization: config.organization,
            workspaceName: config.workspaceName,
            namespaceOverride: this.customConfig?.namespace
        });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config,
            options: this.options
        });
    }

    public getMemoryStreamForString(str: string): csharp.TypeLiteral {
        return csharp.TypeLiteral.reference(
            csharp.instantiateClass({
                classReference: this.getMemoryStreamClassReference(),
                arguments_: [
                    csharp.instantiateClass({
                        classReference: this.getEncodingUtf8ClassReference(),
                        arguments_: [csharp.TypeLiteral.string(str)]
                    })
                ]
            })
        );
    }

    public getClassName(name: FernIr.Name): string {
        return name.pascalCase.safeName;
    }

    public getParameterName(name: FernIr.Name): string {
        return name.camelCase.safeName;
    }

    public getPropertyName(name: FernIr.Name): string {
        return name.pascalCase.safeName;
    }

    public getMethodName(name: FernIr.Name): string {
        return `${name.pascalCase.safeName}Async`;
    }

    public getEnvironmentClassName(): string {
        return this.customConfig?.["environment-class-name"] ?? `${this.getClientPrefix()}Environment`;
    }

    public getRootClientClassName(): string {
        return (
            this.customConfig?.["exported-client-class-name"] ??
            this.customConfig?.["client-class-name"] ??
            `${this.getComputedClientName()}Client`
        );
    }

    public getRootClientClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getRootClientClassName(),
            namespace: this.getRootNamespace()
        });
    }

    public getBaseExceptionClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.customConfig?.["base-exception-class-name"] ?? `${this.getClientPrefix()}Exception`,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getBaseApiExceptionClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.customConfig?.["base-api-exception-class-name"] ?? `${this.getClientPrefix()}ApiException`,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getExceptionClassReference(declaration: FernIr.dynamic.Declaration): csharp.ClassReference {
        return csharp.classReference({
            name: this.getClassName(declaration.name),
            namespace: this.getNamespace(declaration.fernFilepath)
        });
    }

    public getClientOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: CLIENT_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getRequestOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getMemoryStreamClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "MemoryStream",
            namespace: "System.IO"
        });
    }

    public getEncodingUtf8ClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "Encoding.UTF8",
            namespace: "System.Text"
        });
    }

    public getNamespace(fernFilepath: FernIr.FernFilepath, suffix?: string): string {
        let parts = this.getNamespaceSegments(fernFilepath);
        parts = suffix != null ? [...parts, suffix] : parts;
        return [this.getRootNamespace(), ...parts].join(".");
    }

    public getRootNamespace(): string {
        return this.rootNamespace;
    }

    public getCoreNamespace(): string {
        return `${this.getRootNamespace()}.Core`;
    }

    public getNamespaceForPublicCoreClasses(): string {
        return this.customConfig?.["root-namespace-for-core-classes"]
            ? this.getRootNamespace()
            : this.getCoreNamespace();
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): csharp.ClassReference | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return this.getEnvironmentClassReferenceForEnumName(environmentName);
    }

    public getEnvironmentClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: `${this.getEnvironmentClassName()}`,
            namespace: this.getRootNamespace()
        });
    }

    private getEnvironmentClassReferenceForEnumName(name: FernIr.Name): csharp.ClassReference {
        return csharp.classReference({
            name: `${this.getEnvironmentClassName()}.${this.getClassName(name)}`,
            namespace: this.getRootNamespace()
        });
    }

    private getClientPrefix(): string {
        return (
            this.customConfig?.["exported-client-class-name"] ??
            this.customConfig?.["client-class-name"] ??
            this.getComputedClientName()
        );
    }

    private getNamespaceSegments(fernFilepath: FernIr.FernFilepath): string[] {
        const segments = this.customConfig?.["explicit-namespaces"] ? fernFilepath.allParts : fernFilepath.packagePath;
        return segments.map((segment) => segment.pascalCase.safeName);
    }

    private getComputedClientName(): string {
        return `${upperFirst(camelCase(this.config.organization))}${upperFirst(camelCase(this.config.workspaceName))}`;
    }
}

function getRootNamespace({
    organization,
    workspaceName,
    namespaceOverride
}: {
    organization: string;
    workspaceName: string;
    namespaceOverride?: string;
}): string {
    return namespaceOverride ?? upperFirst(camelCase(`${organization}_${upperFirst(camelCase(workspaceName))}`));
}
