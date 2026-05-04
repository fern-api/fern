import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options
} from "@fern-api/browser-compatible-base-generator";
import { ast, CsharpConfigSchema, Generation } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicLiteralMapper } from "./DynamicLiteralMapper.js";
import { DynamicTypeMapper } from "./DynamicTypeMapper.js";
import { FilePropertyMapper } from "./FilePropertyMapper.js";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicLiteralMapper: DynamicLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;

    public readonly generation: Generation;

    public get namespaces(): Generation["namespaces"] {
        return this.generation.namespaces;
    }
    public get registry(): Generation["registry"] {
        return this.generation.registry;
    }
    public get settings(): Generation["settings"] {
        return this.generation.settings;
    }
    public get constants(): Generation["constants"] {
        return this.generation.constants;
    }
    public get names(): Generation["names"] {
        return this.generation.names;
    }
    public get model(): Generation["model"] {
        return this.generation.model;
    }
    public get format(): Generation["format"] {
        return this.generation.format;
    }
    public get csharp(): Generation["csharp"] {
        return this.generation.csharp;
    }
    public get Types(): Generation["Types"] {
        return this.generation.Types;
    }
    public get System(): Generation["extern"]["System"] {
        return this.generation.extern.System;
    }
    public get NUnit(): Generation["extern"]["NUnit"] {
        return this.generation.extern.NUnit;
    }
    public get OneOf(): Generation["extern"]["OneOf"] {
        return this.generation.extern.OneOf;
    }
    public get Google(): Generation["extern"]["Google"] {
        return this.generation.extern.Google;
    }
    public get WireMock(): Generation["extern"]["WireMock"] {
        return this.generation.extern.WireMock;
    }
    public get Primitive(): Generation["Primitive"] {
        return this.generation.Primitive;
    }
    public get Value(): Generation["Value"] {
        return this.generation.Value;
    }
    public get Collection(): Generation["Collection"] {
        return this.generation.Collection;
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
                config.customConfig != null ? (config.customConfig as CsharpConfigSchema) : ({} as CsharpConfigSchema),
                config
            );

        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicLiteralMapper = new DynamicLiteralMapper({ context: this });
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

    public getFileParameterForString(str: string): ast.Literal {
        return this.csharp.Literal.reference(
            this.csharp.instantiateClass({
                classReference: this.Types.FileParameter,
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
        return this.System.IO.MemoryStream.new({
            arguments_: [
                this.csharp.invokeMethod({
                    on: this.System.Text.Encoding_UTF8,
                    method: "GetBytes",
                    arguments_: [this.csharp.Literal.string(str)]
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

    /**
     * Returns a property name that is safe within the given class reference's scope.
     * Detects collisions where PascalCase(property) == ClassName and returns the
     * renamed identifier (e.g., "CatalogV1Id_") to avoid CS0542 / CS0117.
     */
    public resolvePropertyName(classReference: ast.ClassReference, name: FernIr.Name): string {
        const expectedName = name.pascalCase.safeName;
        const redirected = classReference.scope.getRedirectedFieldName(expectedName);
        if (redirected) {
            return redirected;
        }
        if (classReference.scope.isField(expectedName)) {
            return expectedName;
        }
        return classReference.registerField(expectedName);
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
            name: `${this.generation.Types.Environments.name}.${this.getClassName(name)}`,
            namespace: this.namespaces.root
        });
    }

    private getNamespaceSegments(fernFilepath: FernIr.dynamic.FernFilepath): string[] {
        const segments = this.settings.explicitNamespaces ? fernFilepath.allParts : fernFilepath.packagePath;
        return segments.map((segment) => segment.pascalCase.safeName);
    }

    public precalculate(requests: Partial<FernIr.dynamic.EndpointSnippetRequest>[]): void {
        this.generation.initialize();
        this.System.Collections.Generic.KeyValuePair();
        this.System.Collections.Generic.IEnumerable();
        this.System.Collections.Generic.IAsyncEnumerable();
        this.System.Collections.Generic.HashSet();
        this.System.Collections.Generic.List();
        this.System.Collections.Generic.Dictionary();
        this.System.Threading.Tasks.Task();

        // generate the names for the model types
        Object.entries(this.ir.types)
            .sort((a, b) => {
                // sort by shortest key length
                return a[0].length - b[0].length;
            })
            .forEach(([typeId, type]) => {
                this.dynamicTypeMapper.convertToClassReference(type, typeId);
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

        this.generation.Types.ClientOptions;
        this.generation.Types.RootClientForSnippets;

        // after generating the names for everything, freeze the class references
        this.csharp.freezeClassReferences();
    }
}
