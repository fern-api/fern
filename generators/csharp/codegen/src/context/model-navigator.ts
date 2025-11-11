import { fail } from "node:assert";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import {
    DeclaredErrorName,
    DeclaredTypeName,
    ExampleEnumType,
    ExampleNamedType,
    IntermediateRepresentation,
    Name,
    NameAndWireValue,
    NamedType,
    ProtobufService,
    Type,
    TypeDeclaration,
    WebSocketChannel
} from "@fern-fern/ir-sdk/api";
import { type TypesOf } from "../utils/type-extractor";
import { is } from "../utils/type-guards";
import { type Generation } from "./generation-info";

/**
 * JsonPath is a string that represents a path of nodes in the Intermediate Representation (IR) to a given node.
 *
 * The path uses dot notation to traverse the object hierarchy:
 * - For arrays, you will see numbers in the path (e.g., "types.0.properties.1")
 * - For explicitly named nodes (hand-coded names), there will be a '+' in the path (e.g., "types+Value")
 */
export type JsonPath = string;

/**
 * Provenance tracks metadata about where an AST (Abstract Syntax Tree) node came from in the IR.
 *
 * This interface provides a way to trace back from generated code to its origin in the IR,
 * which is essential for understanding why something is named the way it is and for tracking
 * relationships between generated code and source specifications.
 */
export interface Provenance {
    /** The dot-notation path in the IR to this node (trimmed to remove name case variants) */
    jsonPath: string;

    /** The property name or key used to access this node in its parent */
    name: string;

    /** The actual IR node object that this provenance describes */
    node: IrNode;

    /** Optional parent provenance, forming a chain back to the root of the IR */
    parent?: Provenance;

    /** True if this is an explicitly named node (hand-coded name) not directly bound to an IR node */
    explicit?: boolean;
}

/**
 * IrNode represents any valid node type from the Intermediate Representation.
 *
 * This union type includes all possible node types that can appear in the IR tree,
 * including types, services, channels, declarations, and error names. The `Exclude<..., undefined>`
 * ensures that undefined is never considered a valid IR node.
 */
export type IrNode = Exclude<
    | TypesOf<IntermediateRepresentation>
    | TypesOf<FernIr.dynamic.DynamicIntermediateRepresentation>
    | TypeDeclaration
    | ProtobufService
    | WebSocketChannel
    | FernIr.dynamic.NamedType
    | FernIr.dynamic.Declaration
    | DeclaredErrorName
    | DeclaredTypeName, // hack hack hack! Why did it not work without that?
    undefined
>;

/**
 * Origin represents the source of a generated piece of code in the IR.
 *
 * An Origin can be either:
 * - An IrNode: A direct reference to a node in the IR
 * - A Provenance: A reference that includes metadata about the node's location and lineage,
 *   which may represent an explicitly named member (hand-coded name) that doesn't directly
 *   correspond to an IR node but is generated on behalf of one
 */
export type Origin = IrNode | Provenance;

/**
 * Trims a JsonPath by removing naming-related properties to normalize paths for comparison.
 *
 * This function filters out path segments related to name casing (camelCase, snakeCase, etc.)
 * to ensure that two paths referring to the same logical node are considered equivalent
 * regardless of which case variant was used to access the name.
 *
 * @param jsonPath - The full JsonPath to trim
 * @returns The trimmed JsonPath with name case properties removed
 *
 * @example
 * trim("types.User.name.pascalCase") → "types.User"
 */
function trim(jsonPath: JsonPath): JsonPath {
    return jsonPath
        .split(".")
        .filter((part) => !["name", "camelCase", "snakeCase", "screamingSnakeCase", "pascalCase"].includes(part))
        .join(".");
}

/**
 * ModelNavigator provides navigation and lookup capabilities for the Intermediate Representation (IR).
 *
 * This class builds and maintains indexes of the IR tree structure, allowing for efficient lookups
 * and tracking of node provenance. It enables the code generator to:
 *
 * - Navigate the IR tree structure and find nodes by object reference or JsonPath
 * - Track the origin and provenance of generated code elements
 * - Handle explicit (hand-coded) names that don't directly map to IR nodes
 * - Dereference type references to their full declarations
 * - Extract properly formatted names for classes, properties, and enum values
 *
 * The navigator creates multiple indexes during construction to enable fast lookups:
 * - indexByObject: Maps IR nodes to their provenance
 * - indexByPath: Maps JsonPaths to their provenance
 * - explicitByObject: Maps IR nodes to their explicit child provenances
 * - explicitByPath: Maps JsonPaths to explicit provenances
 */
export class ModelNavigator {
    /** Maps IR node objects to their provenance metadata */
    private indexByObject = new Map<IrNode, Provenance>();

    /** Maps JsonPaths (string) to their provenance metadata */
    private indexByPath = new Map<string, Provenance>();

    /** Maps IR nodes to sets of explicit (hand-coded) child provenances */
    private explicitByObject: Map<IrNode, Set<Provenance>> = new Map();

    /** Maps JsonPaths to explicit (hand-coded) provenance entries */
    private explicitByPath: Map<string, Provenance> = new Map();

    /** The root provenance node representing the entire IR tree */
    readonly root: Provenance;

    /** The Intermediate Representation being navigated */
    readonly ir: IntermediateRepresentation | FernIr.dynamic.DynamicIntermediateRepresentation;

    /**
     * Provides access to C# code generation utilities.
     * @returns The C# generation context from the generation info
     */
    get csharp() {
        return this.generation.csharp;
    }

    /**
     * Provides access to the type registry for looking up generated type names.
     * @returns The type registry from the generation info
     */
    get registry() {
        return this.generation.registry;
    }

    /**
     * Creates a new ModelNavigator for the given IR.
     *
     * The constructor builds complete indexes of the IR tree, creating provenance
     * entries for every node and enabling fast lookups by both object reference and path.
     *
     * @param instance - The root IR node (IntermediateRepresentation or DynamicIntermediateRepresentation)
     * @param generation - The generation context providing access to code generation utilities
     */
    constructor(
        instance: IrNode,
        private readonly generation: Generation
    ) {
        this.root = this.createIndex(instance);
        this.ir = instance as IntermediateRepresentation | FernIr.dynamic.DynamicIntermediateRepresentation;
    }

    /**
     * Recursively builds indexes for all nodes in the IR tree.
     *
     * This private method traverses the entire IR object graph and creates provenance entries
     * for each node. It handles path collisions by using a trimming strategy - when multiple
     * paths normalize to the same trimmed path (e.g., "types.User.name.pascalCase" and
     * "types.User.name.camelCase" both trim to "types.User.name"), only the first encounter
     * is stored in indexByPath, and subsequent encounters are redirected to the parent provenance.
     *
     * The algorithm:
     * 1. Trims the current path to normalize it
     * 2. If the path already exists, map this node to the parent provenance (path collision)
     * 3. Otherwise, create a new provenance and store it in both indexes
     * 4. Recursively process all child nodes
     *
     * @param instance - The current IR node being indexed
     * @param key - The property name/key used to access this node (empty string for root)
     * @param parentProvenance - The provenance of the parent node (undefined for root)
     * @returns The provenance for this node (may be parent's provenance if path collision occurred)
     */
    private createIndex(instance: IrNode, key = "", parentProvenance?: Provenance) {
        const jsonPath = trim(parentProvenance?.jsonPath ? `${parentProvenance.jsonPath}.${key}` : key);

        if (this.indexByPath.has(jsonPath)) {
            // if the name was already taken that means that we've trimmed the path so we're not going to store this node
            // in the byPath index because we want lookups to find the parent
            // (this means if we use an xyz.name.name node we'll get back 'xyz' which is the resolved equivalent of the node)

            if (!parentProvenance) {
                fail(`Parent provenance not found for node: ${JSON.stringify(instance).substring(0, 100)}`);
            }

            // if someone looks up this object, dial them back to the parent provenance
            this.indexByObject.set(instance, parentProvenance);

            // but do continue to process the children nodes
            for (const [key, value] of Object.entries(instance)) {
                if (typeof value === "object" && value !== null) {
                    this.createIndex(value, key, parentProvenance);
                }
            }

            return parentProvenance;
        }

        // otherwise, we can store the node in the indexes
        const provenance = {
            jsonPath,
            name: key,
            node: instance,
            parent: parentProvenance
        };
        this.indexByObject.set(instance, provenance);
        this.indexByPath.set(jsonPath, provenance);

        // process the children nodes
        for (const [key, value] of Object.entries(instance)) {
            if (typeof value === "object" && value !== null) {
                this.createIndex(value, key, provenance);
            }
        }

        return provenance;
    }

    /**
     * Creates a provenance for a static explicit name at the root IR level.
     *
     * This is a convenience method that creates an explicit provenance as a child of
     * the root IR node. Use this when you need to generate code with a hand-coded name
     * that relates to the IR as a whole rather than a specific node.
     *
     * @param name - The explicit name to create
     * @returns A new Provenance with the explicit flag set
     */
    staticExplicit(name: string): Provenance {
        return this.explicit(this.ir, name);
    }

    /**
     * Creates an explicit provenance for a hand-coded name that doesn't directly map to an IR node.
     *
     * This method is used when generating code elements that are not directly bound to items in the IR
     * but are logically children of an IR node. For example, a hand-coded "Value" property on an enum
     * that is generated but doesn't correspond to an actual IR node.
     *
     * The explicit provenance:
     * - Has its jsonPath marked with a '+' prefix to indicate it's explicit (e.g., "types.MyEnum+Value")
     * - Maintains a parent-child relationship with the origin node
     * - Is tracked separately in explicitByObject and explicitByPath indexes
     * - Has the explicit flag set to true
     *
     * @param node - The origin node (either an IrNode or existing Provenance) that is the logical parent
     * @param member - The name of the explicit member being created
     * @returns A new Provenance representing the explicit member
     * @throws Error if provenance for the parent node cannot be found
     */
    explicit(node: Origin, member: string): Provenance {
        const parentProvenance =
            this.provenance(node) ?? fail(`Provenance not found for node: ${JSON.stringify(node).substring(0, 100)}`);

        const element = {
            ...parentProvenance,
            jsonPath: trim(`${parentProvenance.jsonPath}+${member}`),
            name: member,
            node: parentProvenance.node,
            parent: parentProvenance,
            explicit: true
        };
        const set = this.explicitByObject.get(parentProvenance.node);
        if (set) {
            set.add(element);
        } else {
            this.explicitByObject.set(parentProvenance.node, new Set([element]));
        }
        this.explicitByPath.set(element.jsonPath, element);
        return element;
    }

    /**
     * Retrieves the provenance for a given source (JsonPath, IrNode, or existing Provenance).
     *
     * This is the primary lookup method for finding provenance information. It supports multiple
     * input types for flexibility:
     * - JsonPath (string): Looks up by path, checking explicit paths first, then regular paths
     * - Provenance: Validates and returns the provenance (checking explicit paths first)
     * - IrNode: Looks up the provenance by object reference
     * - undefined: Returns undefined
     *
     * Note: When looking up an IrNode, if the node's path was trimmed during indexing
     * (due to path collision), this will return the parent provenance instead.
     *
     * @param source - The JsonPath, IrNode, Provenance, or undefined to look up
     * @returns The Provenance for the source, or undefined if not found or source is undefined
     */
    provenance(source: JsonPath | IrNode | Provenance | undefined): Provenance | undefined {
        if (source === undefined) {
            return undefined;
        }

        if (is.string(source)) {
            return this.explicitByPath.get(source) ?? this.indexByPath.get(source);
        }
        if (is.Provenance(source)) {
            return this.explicitByPath.get(source.jsonPath) ?? this.indexByPath.get(source.jsonPath);
        }

        // get the provenance for the node requested (may return the parent provenance if the node was trimmed)
        return this.indexByObject.get(source);
    }

    /**
     * Retrieves the Origin for a given source.
     *
     * An Origin is either:
     * - A Provenance (if the source is an explicit/hand-coded member)
     * - An IrNode (if the source is a regular IR node)
     *
     * This method first looks up the provenance, then determines whether to return
     * the provenance itself (if explicit) or just the underlying IrNode.
     *
     * @param source - The IrNode, JsonPath, Provenance, or undefined to look up
     * @returns The Origin (either Provenance or IrNode), or undefined if not found
     */
    origin(source: IrNode | JsonPath | Provenance | undefined): Origin | undefined {
        const provenance = this.provenance(source);
        return provenance?.explicit ? provenance : provenance?.node;
    }

    /**
     * Retrieves the actual IR node for a given source.
     *
     * This method always returns the underlying IrNode, regardless of whether the
     * source is an explicit provenance or a regular node. It's useful when you need
     * the actual IR data rather than metadata about it.
     *
     * @param source - The IrNode, JsonPath, Provenance, or undefined to look up
     * @returns The underlying IrNode, or undefined if not found
     */
    irNode(source: IrNode | JsonPath | Provenance | undefined): IrNode | undefined {
        return this.provenance(source)?.node;
    }

    /**
     * Retrieves the JsonPath for a given source.
     *
     * This method extracts the JsonPath from the provenance of the source.
     * The JsonPath represents the location of the node in the IR tree.
     *
     * @param source - The IrNode, JsonPath, Provenance, or undefined to look up
     * @returns The JsonPath string, or undefined if not found
     */
    jsonPath(source: IrNode | JsonPath | Provenance | undefined): JsonPath | undefined {
        return this.provenance(source)?.jsonPath;
    }

    /**
     * Gets the C# property name for an enum value.
     *
     * This method resolves the property name that should be used in generated C# code
     * for a specific enum value. It:
     * 1. Extracts the name from either a NameAndWireValue or ExampleEnumType
     * 2. Finds the matching enum member in the enum's values array
     * 3. Returns the formatted property name for that member
     *
     * @param typeEnum - The enum type definition containing all possible values
     * @param valueName - The enum value to look up (either a NameAndWireValue or ExampleEnumType)
     * @returns The property name to use in generated C# code
     * @throws Error if the enum value name cannot be found in the enum definition
     */
    getEnumValueName(typeEnum: Type.Enum, valueName: NameAndWireValue | ExampleEnumType): string {
        // get the name of the enum value
        const name = is.IR.ExampleEnumType(valueName) ? valueName.value.name : valueName.name;
        // match the name given to the name in the actual type
        const member = typeEnum.values.find((v) => this.nameEquals(v.name.name, name));
        // return the property name for that value
        return member ? this.getPropertyNameFor(member) : fail(`Unexpected - can't find enum value ${name} in enum`);
    }

    /**
     * Gets the C# property name for any property-like Origin.
     *
     * This method determines the appropriate property name for use in generated C# code.
     * It follows a priority chain to extract the name:
     *
     * 1. Checks the registry for a pre-registered field name (fast path)
     * 2. If the origin is a Provenance, uses its name directly
     * 3. If the origin has a 'name' property:
     *    - NameAndWireValue: Uses the PascalCase safe name
     *    - Name: Uses the PascalCase safe name
     *    - string: Uses the string directly
     * 4. If the origin has a 'pascalCase' property: Uses the safe name
     * 5. Otherwise: Throws an error
     *
     * @param property - The origin representing a property (can be an IrNode or Provenance)
     * @returns The property name formatted for use in C# code
     * @throws Error if the property type cannot be determined or doesn't have a name
     */
    getPropertyNameFor(property: Origin): string {
        const fast = this.registry.getFieldNameByOrigin(property);
        if (fast) {
            return fast;
        }
        if (is.Provenance(property)) {
            return property.name;
        }
        if ("name" in property) {
            if (is.IR.NameAndWireValue(property.name)) {
                return property.name.name.pascalCase.safeName;
            }
            if (is.IR.Name(property.name)) {
                return property.name.pascalCase.safeName;
            }
            if (typeof property.name === "string") {
                return property.name;
            }
        }
        if ("pascalCase" in property) {
            return property.pascalCase.safeName;
        }

        throw new Error(`Unknown property type: ${this.jsonPath(property)}`);
    }

    /**
     * Gets the C# class name for any class-like Origin.
     *
     * This method determines the appropriate class name for use in generated C# code.
     * It follows a priority chain similar to getPropertyNameFor:
     *
     * 1. If the origin is a Provenance, uses its name directly
     * 2. If the origin has a 'name' property:
     *    - TypeDeclaration: Uses the PascalCase safe name from the type's name
     *    - NameAndWireValue: Uses the PascalCase safe name
     *    - Name: Uses the PascalCase safe name
     *    - string: Uses the string directly
     * 3. If the origin has a 'pascalCase' property: Uses the safe name
     * 4. Otherwise: Throws an error
     *
     * @param classDeclaration - The origin representing a class/type (can be an IrNode or Provenance)
     * @returns The class name formatted for use in C# code
     * @throws Error if the class type cannot be determined or doesn't have a name
     */
    getClassNameFor(classDeclaration: Origin): string {
        if (is.Provenance(classDeclaration)) {
            return classDeclaration.name;
        }
        if ("name" in classDeclaration) {
            if (is.IR.TypeDeclaration(classDeclaration)) {
                return classDeclaration.name.name.pascalCase.safeName;
            }
            if (is.IR.NameAndWireValue(classDeclaration.name)) {
                return classDeclaration.name.name.pascalCase.safeName;
            }
            if (is.IR.Name(classDeclaration.name)) {
                return classDeclaration.name.pascalCase.safeName;
            }
            if (typeof classDeclaration.name === "string") {
                return classDeclaration.name;
            }
        }
        if ("pascalCase" in classDeclaration) {
            return classDeclaration.pascalCase.safeName;
        }

        throw new Error(`Unknown property type: ${JSON.stringify(classDeclaration)}`);
    }

    /**
     * Compares two IR Name objects for equality.
     *
     * Names in the IR can have multiple case variants (camelCase, PascalCase, snake_case, etc.).
     * This method determines if two names refer to the same logical entity by comparing their
     * camelCase safeName representations. Using camelCase as the canonical form ensures
     * consistent equality checks regardless of which case variant is used.
     *
     * @param name1 - The first Name object to compare
     * @param name2 - The second Name object to compare
     * @returns true if the names are equal (same camelCase safeName), false otherwise
     */
    nameEquals(name1: Name, name2: Name): boolean {
        return name1.camelCase.safeName === name2.camelCase.safeName;
    }

    /**
     * Dereferences a type reference to get its full type declaration.
     *
     * In the IR, types can be referenced in several ways (by ID string, by NamedType,
     * by DeclaredTypeName, by ExampleNamedType, or by TypeDeclaration directly).
     * This method resolves any of these references to the actual TypeDeclaration
     * stored in the IR's types map.
     *
     * The method:
     * 1. Extracts the typeId from whatever form of type reference is provided
     * 2. Looks up the type in the IR's types map using that typeId
     * 3. Returns both the typeId and the full TypeDeclaration
     *
     * This overload signature requires that the result be a standard TypeDeclaration
     * (not a dynamic NamedType), which is enforced by the input types.
     *
     * @param typeIdOrDeclaration - A type reference in any supported form
     * @returns An object containing the typeId and the resolved TypeDeclaration
     * @throws Error if the typeId cannot be resolved to a TypeDeclaration
     */
    dereferenceType(typeIdOrDeclaration: TypeDeclaration | NamedType | DeclaredTypeName | ExampleNamedType | string): {
        typeId: string;
        typeDeclaration: TypeDeclaration;
    };
    /**
     * Dereferences a type reference to get its full type declaration (dynamic IR variant).
     *
     * This overload is similar to the standard dereferenceType but supports resolving
     * to either a standard TypeDeclaration or a dynamic FernIr.dynamic.NamedType.
     * The commented-out FernIr.dynamic.NamedType in the input types suggests this
     * may be partially implemented or in transition.
     *
     * @param typeIdOrDeclaration - A type reference in any supported form (excluding ExampleNamedType)
     * @returns An object containing the typeId and the resolved TypeDeclaration or dynamic NamedType
     * @throws Error if the typeId cannot be resolved to a type declaration
     */
    dereferenceType(
        typeIdOrDeclaration: TypeDeclaration | NamedType | DeclaredTypeName /* | FernIr.dynamic.NamedType */ | string
    ): {
        typeId: string;
        typeDeclaration: TypeDeclaration | FernIr.dynamic.NamedType;
    } {
        // get the typeId and name
        const typeId = is.string(typeIdOrDeclaration)
            ? typeIdOrDeclaration
            : is.IR.NamedType(typeIdOrDeclaration) || is.IR.DeclaredTypeName(typeIdOrDeclaration)
              ? typeIdOrDeclaration.typeId
              : is.IR.ExampleNamedType(typeIdOrDeclaration)
                ? typeIdOrDeclaration.typeName.typeId
                : typeIdOrDeclaration.name.typeId;

        // resolve the typeId to the actual type in the bottom of the IR
        const declaration = this.irNode(this.ir.types[typeId]);
        if (is.IR.TypeDeclaration(declaration)) {
            return {
                typeId,
                typeDeclaration: declaration
            };
        }
        fail(`dereferenceType: typeId ${typeId} not resolved.`);
    }
}
