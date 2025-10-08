import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { ast, BaseCsharpCustomConfigSchema, CSharp } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { camelCase, upperFirst } from "lodash-es";
import { SNIPPET_NAMESPACE } from "../constants";
import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";
const REQUEST_OPTIONS_CLASS_NAME = "RequestOptions";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseCsharpCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;
    public rootNamespace: string;
    public readonly csharp: CSharp;
    constructor({
        ir,
        config,
        options,
        csharp
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        options?: Options;
        csharp?: CSharp;
    }) {
        super({ ir, config, options });
        this.csharp = csharp ?? new CSharp();

        this.ir = ir;
        this.customConfig =
            config.customConfig != null
                ? (config.customConfig as BaseCsharpCustomConfigSchema)
                : ({} as BaseCsharpCustomConfigSchema);

        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
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
            options: this.options,
            csharp: this.csharp
        });
    }

    public getFileParameterForString(str: string): ast.TypeLiteral {
        return this.csharp.TypeLiteral.reference(
            this.csharp.instantiateClass({
                classReference: this.getFileParameterClassReference(),
                arguments_: [],
                properties: [
                    {
                        name: "Stream",
                        value: this.getMemoryStreamForString(str)
                    }
                ],
                multiline: true
            })
        );
    }

    public getMemoryStreamForString(str: string): ast.ClassInstantiation {
        return this.csharp.instantiateClass({
            classReference: this.getMemoryStreamClassReference(),
            arguments_: [
                this.csharp.invokeMethod({
                    on: this.getEncodingUtf8ClassReference(),
                    method: "GetBytes",
                    arguments_: [this.csharp.TypeLiteral.string(str)]
                })
            ]
        });
    }

    public getClassName(name: FernIr.Name): string {
        return name.pascalCase.safeName;
    }

    public getUnionInnerClassName(name: FernIr.Name): string {
        if (["Value", "Type"].includes(name.pascalCase.safeName)) {
            return `${name.pascalCase.safeName}Inner`;
        }
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

    public shouldUseDiscriminatedUnions(): boolean {
        return this.customConfig?.["use-discriminated-unions"] ?? true;
    }

    public getRootClientClassName(): string {
        return (
            this.customConfig?.["exported-client-class-name"] ??
            this.customConfig?.["client-class-name"] ??
            `${this.getComputedClientName()}Client`
        );
    }

    public getRootClientClassReference(): ast.ClassReference {
        const fullyQualified =
            this.csharp.nameRegistry.isKnownIdentifier(this.getRootClientClassName()) ||
            this.csharp.nameRegistry.isKnownIdentifier(this.getRootNamespace());
        return this.csharp.classReference({
            name: this.getRootClientClassName(),
            namespace: this.getRootNamespace(),
            fullyQualified
        });
    }

    public getBaseExceptionClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: this.customConfig?.["base-exception-class-name"] ?? `${this.getClientPrefix()}Exception`,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getBaseApiExceptionClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: this.customConfig?.["base-api-exception-class-name"] ?? `${this.getClientPrefix()}ApiException`,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getExceptionClassReference(declaration: FernIr.dynamic.Declaration): ast.ClassReference {
        return this.csharp.classReference({
            name: this.getClassName(declaration.name),
            namespace: this.getNamespace(declaration.fernFilepath)
        });
    }

    public getClientOptionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: CLIENT_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getRequestOptionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getFileParameterClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "FileParameter",
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getMemoryStreamClassReference(): ast.ClassReference {
        return this.csharp.System.IO.MemoryStream;
    }

    public getEncodingUtf8ClassReference(): ast.ClassReference {
        return this.csharp.System.Text.Encoding_UTF8;
    }

    public getNamespace(fernFilepath: FernIr.dynamic.FernFilepath, suffix?: string): string {
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
        const rootNamespaceForCoreClasses = this.customConfig?.["root-namespace-for-core-classes"];
        if (rootNamespaceForCoreClasses == null) {
            return this.getRootNamespace();
        }
        return rootNamespaceForCoreClasses ? this.getRootNamespace() : this.getCoreNamespace();
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): ast.ClassReference | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return this.getEnvironmentClassReferenceForEnumName(environmentName);
    }

    public getEnvironmentClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: `${this.getEnvironmentClassName()}`,
            namespace: this.getRootNamespace()
        });
    }

    private getEnvironmentClassReferenceForEnumName(name: FernIr.Name): ast.ClassReference {
        return this.csharp.classReference({
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

    private getNamespaceSegments(fernFilepath: FernIr.dynamic.FernFilepath): string[] {
        const segments = this.customConfig?.["explicit-namespaces"] ? fernFilepath.allParts : fernFilepath.packagePath;
        return segments.map((segment) => segment.pascalCase.safeName);
    }

    private getComputedClientName(): string {
        return `${upperFirst(camelCase(this.config.organization))}${upperFirst(camelCase(this.config.workspaceName))}`;
    }

    public precalculate(requests: Partial<FernIr.dynamic.EndpointSnippetRequest>[]): void {
        this.csharp.nameRegistry.addImplicitNamespace(this.getRootNamespace());
        this.csharp.System.Collections.Generic.KeyValuePair();
        this.csharp.System.Collections.Generic.IEnumerable();
        this.csharp.System.Collections.Generic.IAsyncEnumerable();
        this.csharp.System.Collections.Generic.HashSet();
        this.csharp.System.Collections.Generic.List();
        this.csharp.System.Collections.Generic.Dictionary();
        this.csharp.System.Threading.Tasks.Task();

        // generate the names for the model types
        Object.entries(this.ir.types)
            .sort((a, b) => {
                // sort by shortest key length
                return a[0].length - b[0].length;
            })
            .forEach(([typeId, type]) => {
                this.dynamicTypeMapper.convertToClassReference(type);
            });

        for (const [idx, request] of requests.entries()) {
            // generate the class names for the examples

            this.csharp.classReference({
                name: `Example${idx}`,
                namespace: SNIPPET_NAMESPACE
            });

            if (request.endpoint) {
                const endpoints = this.resolveEndpointLocation(request.endpoint);
                for (const endpoint of endpoints) {
                    switch (endpoint.request.type) {
                        case "inlined":
                            this.csharp.classReference({
                                name: this.getClassName(endpoint.request.declaration.name),
                                namespace: this.getNamespace(endpoint.request.declaration.fernFilepath)
                            });

                            break;

                        case "body":
                            break;
                    }
                }
            }
        }

        this.getClientOptionsClassReference();
        this.getRootClientClassReference();

        // after generating the names for everything, freeze the class references
        this.csharp.freezeClassReferences();
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
