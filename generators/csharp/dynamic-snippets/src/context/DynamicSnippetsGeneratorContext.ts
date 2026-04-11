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

type TypeId = string;

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicLiteralMapper: DynamicLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;

    public readonly generation: Generation;

    private _inlineTypeParentMap: Map<TypeId, TypeId> | undefined;
    private _inlineTypeChildrenMap: Map<TypeId, Set<TypeId>> | undefined;

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

    /**
     * Returns the set of inline type IDs from the dynamic IR.
     * The inlineTypes field is populated by the DynamicSnippetsConverter from the full IR.
     * Since @fern-api/dynamic-ir-sdk may not yet have the field in its types,
     * we access it via type assertion.
     */
    private getInlineTypeIds(): Set<TypeId> {
        const ir = this.ir as FernIr.dynamic.DynamicIntermediateRepresentation & { inlineTypes?: TypeId[] };
        return new Set(ir.inlineTypes ?? []);
    }

    /**
     * Extracts all named TypeIds referenced from a dynamic TypeReference,
     * recursing into containers and following alias chains.
     */
    private extractNamedTypeIdsFromDynamicTypeReference(
        typeRef: FernIr.dynamic.TypeReference,
        visited?: Set<TypeId>
    ): TypeId[] {
        switch (typeRef.type) {
            case "named": {
                const ids: TypeId[] = [typeRef.value];
                const decl = this.ir.types[typeRef.value];
                if (decl?.type === "alias") {
                    const visitedSet = visited ?? new Set<TypeId>();
                    if (!visitedSet.has(typeRef.value)) {
                        visitedSet.add(typeRef.value);
                        ids.push(...this.extractNamedTypeIdsFromDynamicTypeReference(decl.typeReference, visitedSet));
                    }
                }
                return ids;
            }
            case "list":
                return this.extractNamedTypeIdsFromDynamicTypeReference(typeRef.value, visited);
            case "set":
                return this.extractNamedTypeIdsFromDynamicTypeReference(typeRef.value, visited);
            case "map":
                return [
                    ...this.extractNamedTypeIdsFromDynamicTypeReference(typeRef.key, visited),
                    ...this.extractNamedTypeIdsFromDynamicTypeReference(typeRef.value, visited)
                ];
            case "optional":
            case "nullable":
                return this.extractNamedTypeIdsFromDynamicTypeReference(typeRef.value, visited);
            case "literal":
            case "primitive":
            case "unknown":
                return [];
            default:
                return [];
        }
    }

    /**
     * Builds inline type parent and children maps from the dynamic IR.
     * Mirrors the logic in GeneratorContext.buildInlineTypeMaps() but adapted
     * for the dynamic IR type structures.
     */
    private buildInlineTypeMaps(): void {
        if (this._inlineTypeParentMap != null) {
            return;
        }
        const parentMap = new Map<TypeId, TypeId>();
        const childrenMap = new Map<TypeId, Set<TypeId>>();
        const inlineTypeIds = this.getInlineTypeIds();

        if (inlineTypeIds.size === 0) {
            this._inlineTypeParentMap = parentMap;
            this._inlineTypeChildrenMap = childrenMap;
            return;
        }

        // First pass: for each non-alias type, collect inline types it references
        const inlineTypeReferencers = new Map<TypeId, Set<TypeId>>();

        for (const [typeId, namedType] of Object.entries(this.ir.types)) {
            if (namedType.type === "alias") {
                continue;
            }

            const referencedTypeIds: TypeId[] = [];

            switch (namedType.type) {
                case "object":
                    for (const property of namedType.properties) {
                        referencedTypeIds.push(
                            ...this.extractNamedTypeIdsFromDynamicTypeReference(property.typeReference)
                        );
                    }
                    break;
                case "enum":
                    // Enums don't reference other types
                    break;
                case "discriminatedUnion":
                    for (const singleType of Object.values(namedType.types)) {
                        switch (singleType.type) {
                            case "samePropertiesAsObject":
                                referencedTypeIds.push(singleType.typeId);
                                break;
                            case "singleProperty":
                                referencedTypeIds.push(
                                    ...this.extractNamedTypeIdsFromDynamicTypeReference(singleType.typeReference)
                                );
                                break;
                            case "noProperties":
                                break;
                        }
                    }
                    break;
                case "undiscriminatedUnion":
                    for (const typeReference of namedType.types) {
                        referencedTypeIds.push(...this.extractNamedTypeIdsFromDynamicTypeReference(typeReference));
                    }
                    break;
            }

            for (const refTypeId of referencedTypeIds) {
                if (inlineTypeIds.has(refTypeId)) {
                    if (!inlineTypeReferencers.has(refTypeId)) {
                        inlineTypeReferencers.set(refTypeId, new Set());
                    }
                    inlineTypeReferencers.get(refTypeId)?.add(typeId);
                }
            }
        }

        // Second pass: only inline types referenced by exactly one non-alias parent
        for (const [inlineTypeId, referencers] of inlineTypeReferencers) {
            if (referencers.size === 1) {
                const parentTypeId = [...referencers][0];
                if (parentTypeId != null) {
                    parentMap.set(inlineTypeId, parentTypeId);
                    if (!childrenMap.has(parentTypeId)) {
                        childrenMap.set(parentTypeId, new Set());
                    }
                    childrenMap.get(parentTypeId)?.add(inlineTypeId);
                }
            }
        }

        // Third pass: remove orphaned inline subtrees
        const orphanedParents = new Set<TypeId>();
        for (const [_, parentTypeId] of parentMap) {
            let currentParent: TypeId | undefined = parentTypeId;
            while (currentParent != null) {
                if (inlineTypeIds.has(currentParent) && !parentMap.has(currentParent)) {
                    orphanedParents.add(currentParent);
                    break;
                }
                currentParent = parentMap.get(currentParent);
            }
        }

        if (orphanedParents.size > 0) {
            const toRemove = new Set<TypeId>();
            const collectOrphanedDescendants = (typeId: TypeId) => {
                toRemove.add(typeId);
                const children = childrenMap.get(typeId);
                if (children) {
                    for (const childId of children) {
                        collectOrphanedDescendants(childId);
                    }
                }
            };
            for (const orphanedParent of orphanedParents) {
                collectOrphanedDescendants(orphanedParent);
            }
            for (const typeId of toRemove) {
                const parent = parentMap.get(typeId);
                if (parent != null) {
                    childrenMap.get(parent)?.delete(typeId);
                }
                parentMap.delete(typeId);
                childrenMap.delete(typeId);
            }
        }

        this._inlineTypeParentMap = parentMap;
        this._inlineTypeChildrenMap = childrenMap;
    }

    /**
     * Returns true if the given typeId is an inline type with a parent in the map
     * and the enable-inline-types feature is enabled.
     */
    public isInlineType(typeId: TypeId): boolean {
        if (!this.settings.enableInlineTypes) {
            return false;
        }
        this.buildInlineTypeMaps();
        return this._inlineTypeParentMap?.has(typeId) ?? false;
    }

    /**
     * Returns the parent typeId for an inline type, or undefined if not inline.
     */
    public getInlineTypeParent(typeId: TypeId): TypeId | undefined {
        this.buildInlineTypeMaps();
        return this._inlineTypeParentMap?.get(typeId);
    }

    /**
     * Returns the set of direct inline child typeIds for a parent type.
     */
    public getInlineTypeChildren(typeId: TypeId): Set<TypeId> | undefined {
        this.buildInlineTypeMaps();
        return this._inlineTypeChildrenMap?.get(typeId);
    }

    /**
     * Returns the name for the nested static class that holds inline types.
     * Checks for collision with properties and union variant names.
     */
    public getInlineTypesClassName(parentTypeId: TypeId): string {
        const namedType = this.ir.types[parentTypeId];
        if (namedType == null) {
            return "Types";
        }

        // Collect property names and union variant names that could collide
        const propertyNames = new Set<string>();
        if (namedType.type === "object") {
            for (const prop of namedType.properties) {
                propertyNames.add(prop.name.name.pascalCase.safeName);
            }
            // Also check extended type properties
            if (namedType.extends) {
                for (const extTypeId of namedType.extends) {
                    const extType = this.ir.types[extTypeId];
                    if (extType?.type === "object") {
                        for (const prop of extType.properties) {
                            propertyNames.add(prop.name.name.pascalCase.safeName);
                        }
                    }
                }
            }
        } else if (namedType.type === "discriminatedUnion") {
            for (const singleType of Object.values(namedType.types)) {
                propertyNames.add(singleType.discriminantValue.name.pascalCase.safeName);
            }
        }

        let className = "Types";
        if (propertyNames.has(className)) {
            className = "InnerTypes";
            let counter = 2;
            while (propertyNames.has(className)) {
                className = `InnerTypes${counter}`;
                counter++;
            }
        }
        return className;
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

        // Build inline type maps before generating names
        this.buildInlineTypeMaps();

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
