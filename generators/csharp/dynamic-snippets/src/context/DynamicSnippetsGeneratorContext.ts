import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { ast, BaseCsharpCustomConfigSchema, Generation } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;

    public readonly generation: Generation;

    public get namespaces() {
        return this.generation.namespaces;
    }
    public get registry() {
        return this.generation.registry;
    }
    public get extern() {
        return this.generation.extern;
    }
    public get settings() {
        return this.generation.settings;
    }
    public get constants() {
        return this.generation.constants;
    }
    public get names() {
        return this.generation.names;
    }
    public get types() {
        return this.generation.types;
    }
    public get model() {
        return this.generation.model;
    }
    public get csharp() {
        return this.generation.csharp;
    }
    public get System() {
        return this.extern.System;
    }
    public get NUnit() {
        return this.extern.NUnit;
    }
    public get OneOf() {
        return this.extern.OneOf;
    }
    public get Google() {
        return this.extern.Google;
    }

    constructor({
        ir,
        config,
        options,
        generation
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        options?: Options;
        generation?: Generation;
    }) {
        super({ ir, config, options });
        this.ir = ir;

        this.generation =
            generation ??
            new Generation(
                ir,
                config.workspaceName,
                config.customConfig != null
                    ? (config.customConfig as BaseCsharpCustomConfigSchema)
                    : ({} as BaseCsharpCustomConfigSchema),
                config
            );

        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config,
            options: this.options,
            generation: this.generation
        });
    }

    public getFileParameterForString(str: string): ast.TypeLiteral {
        return this.csharp.TypeLiteral.reference(
            this.csharp.instantiateClass({
                classReference: this.types.FileParameter,
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
            classReference: this.extern.System.IO.MemoryStream,
            arguments_: [
                this.csharp.invokeMethod({
                    on: this.extern.System.Text.Encoding_UTF8,
                    method: "GetBytes",
                    arguments_: [this.csharp.TypeLiteral.string(str)]
                })
            ]
        });
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

    public getNamespace(fernFilepath: FernIr.dynamic.FernFilepath, suffix?: string): string {
        let parts = this.getNamespaceSegments(fernFilepath);
        parts = suffix != null ? [...parts, suffix] : parts;
        return [this.namespaces.root, ...parts].join(".");
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): ast.ClassReference | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return this.getEnvironmentClassReferenceForEnumName(environmentName);
    }

    private getEnvironmentClassReferenceForEnumName(name: FernIr.Name): ast.ClassReference {
        return this.csharp.classReference({
            name: `${this.generation.types.Environments.name}.${this.getClassName(name)}`,
            namespace: this.namespaces.root
        });
    }

    private getNamespaceSegments(fernFilepath: FernIr.dynamic.FernFilepath): string[] {
        const segments = this.settings.explicitNamespaces ? fernFilepath.allParts : fernFilepath.packagePath;
        return segments.map((segment) => segment.pascalCase.safeName);
    }

    public precalculate(requests: Partial<FernIr.dynamic.EndpointSnippetRequest>[]): void {
        this.generation.initialize();
        this.extern.System.Collections.Generic.KeyValuePair();
        this.extern.System.Collections.Generic.IEnumerable();
        this.extern.System.Collections.Generic.IAsyncEnumerable();
        this.extern.System.Collections.Generic.HashSet();
        this.extern.System.Collections.Generic.List();
        this.extern.System.Collections.Generic.Dictionary();
        this.extern.System.Threading.Tasks.Task();

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
                origin: this.model.staticExplicit(`Example${idx}`),
                namespace: "Usage"
            });

            if (request.endpoint) {
                const endpoints = this.resolveEndpointLocation(request.endpoint);
                for (const endpoint of endpoints) {
                    switch (endpoint.request.type) {
                        case "inlined":
                            this.csharp.classReference({
                                origin: endpoint.request.declaration.name,
                                namespace: this.getNamespace(endpoint.request.declaration.fernFilepath)
                            });

                            break;

                        case "body":
                            break;
                    }
                }
            }
        }

        this.generation.types.ClientOptions;
        this.generation.types.RootClient;

        // after generating the names for everything, freeze the class references
        this.csharp.freezeClassReferences();
    }
}
