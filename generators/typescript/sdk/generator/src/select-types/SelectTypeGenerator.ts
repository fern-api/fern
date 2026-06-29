import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { FernIr, serialization as IrSerialization } from "@fern-fern/ir-sdk";
import { getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { TypeContext } from "@fern-typescript/contexts";
import { TypeResolver } from "@fern-typescript/resolvers";
import {
    InterfaceDeclarationStructure,
    PropertySignatureStructure,
    StructureKind,
    TypeAliasDeclarationStructure,
    VariableDeclarationKind,
    VariableStatementStructure
} from "ts-morph";

/**
 * Structural mirror of `FernIr.GraphqlFieldArgument`. Defined locally because generators compile
 * against the *published* `@fern-fern/ir-sdk`, which may predate the IR change that adds
 * `graphqlFieldArguments` (mirrors how `SdkGenerator.hasGraphqlEndpoints` reads the `graphql`
 * transport variant structurally). When the published IR catches up these can be deleted in favor of
 * `FernIr.GraphqlFieldArgument`.
 */
interface GraphqlFieldArgumentShape {
    name: FernIr.NameAndWireValueOrString;
    valueType: FernIr.TypeReference;
    graphqlType: string;
    docs?: string;
}

/** Structural mirror of `FernIr.GraphqlObjectFieldArguments` (see {@link GraphqlFieldArgumentShape}). */
interface GraphqlObjectFieldArgumentsShape {
    fields: Record<string, GraphqlFieldArgumentShape[]>;
}

export declare namespace SelectTypeGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        typeResolver: TypeResolver;
        caseConverter: CaseConverter;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        /**
         * Type context bound to the single Select-types source file. Used to render nested-field
         * `$args` argument value types (`FernIr.TypeReference` → TS) with proper imports for named
         * arg types (e.g. enums/input objects). Optional so the generator degrades gracefully (and
         * for tests) — without it, `$args` are still typed but named arg types fall back to `unknown`.
         */
        typeContext?: TypeContext;
    }
}

/**
 * Generates the per-type `<Name>Select` field-selection interfaces used to give GraphQL `select`
 * arguments full autocomplete and compile-time field checking. A `<Name>Select` is structurally a
 * `GraphqlSelection` at runtime, so `core.buildGraphqlQuery` continues to work unchanged — this is a
 * purely additive typing layer.
 *
 * Selection rules:
 * - Object type → for each property `<prop>?: <selectFieldType>`, where `<selectFieldType>` is
 *   `boolean` for scalar/enum/literal/unknown/map values, or `boolean | <Child>Select` when the
 *   property's value type resolves (through optional/list/set/nullable containers) to a named
 *   object/union type.
 * - Interface type (object with `extends`) → same as object, plus `__typename?: boolean`.
 * - Undiscriminated union → `{ __typename?: boolean; $on?: { <Member>?: <Member>Select } }` over the
 *   union's named members.
 * - Aliases / enums / scalars get no Select type.
 *
 * Nested-field arguments (`$args`): for any field whose wire name has GraphQL arguments (carried in
 * `ir.graphqlFieldArguments`), a `<PascalType><PascalField>Args` interface is emitted and the field's
 * select value type is widened to allow `{ $args?: <ArgsType>, ... }`.
 *
 * All interfaces are emitted into a single source file so they can reference each other (and recurse)
 * by bare identifier without cross-file import management.
 */
export class SelectTypeGenerator {
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly typeResolver: TypeResolver;
    private readonly case: CaseConverter;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly typeContext: TypeContext | undefined;

    constructor({
        ir,
        typeResolver,
        caseConverter,
        includeSerdeLayer,
        retainOriginalCasing,
        typeContext
    }: SelectTypeGenerator.Init) {
        this.ir = ir;
        this.typeResolver = typeResolver;
        this.case = caseConverter;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.typeContext = typeContext;
    }

    /**
     * Builds the ts-morph statement structures for every `<Name>Select` interface (plus any
     * `<Type><Field>Args` interfaces for fields with GraphQL arguments). Types that do not produce a
     * Select type (aliases, enums, scalars) are skipped.
     *
     * For each type that gets a `<Name>Select`, a sibling `<Name>DefaultSelection` `as const` constant
     * is also emitted. It holds every safe-scalar leaf field of the type (excluding deprecated, object,
     * list, and union fields, as well as the `__on`/`__args` control keys) and is used as the default
     * value when a caller omits the `selection` argument on a GraphQL operation — "no selection → a
     * sensible default, never a compile error". A type with no safe scalars (e.g. a connection wrapper)
     * gets `{ __typename: true }` so the default is always a valid, non-empty selection.
     */
    public generateStatements(): (
        | InterfaceDeclarationStructure
        | TypeAliasDeclarationStructure
        | VariableStatementStructure
    )[] {
        const statements: (InterfaceDeclarationStructure | TypeAliasDeclarationStructure)[] = [];
        const defaultSelections: VariableStatementStructure[] = [];
        const argInterfaces: InterfaceDeclarationStructure[] = [];
        const fragmentEntries: { typeName: string; selectName: string }[] = [];
        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            const structure = this.generateSelectTypeForDeclaration(typeDeclaration, typeId, argInterfaces);
            if (structure != null) {
                statements.push(structure);
                defaultSelections.push(this.generateDefaultSelectionForDeclaration(typeDeclaration));
                fragmentEntries.push({
                    typeName: this.case.pascalSafe(typeDeclaration.name.name),
                    selectName: this.getSelectName(typeDeclaration.name)
                });
            }
        }
        const fragmentOn = fragmentEntries.length > 0 ? [this.buildFragmentOnStatement(fragmentEntries)] : [];
        // The default-selection consts follow each block of Select interfaces; the args interfaces and
        // the `fragmentOn` helper are appended last. Ordering does not matter for TS resolution since
        // they share one file.
        return [...statements, ...defaultSelections, ...argInterfaces, ...fragmentOn];
    }

    /**
     * Emits the `fragmentOn` helper for reusable, precisely-typed selections (PRD §10.5). Each entry is
     * a const-generic identity function — `Type: <const S extends TypeSelect>(selection: S): S` — so a
     * hoisted selection keeps its literal type (`{ id: true }`, not `{ id: boolean }`) and still drives
     * selection inference when passed to an operation. Without this helper, hoisting a selection widens
     * its literal types and breaks the result narrowing.
     */
    private buildFragmentOnStatement(entries: { typeName: string; selectName: string }[]): VariableStatementStructure {
        return {
            kind: StructureKind.VariableStatement,
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name: "fragmentOn",
                    initializer: (writer) => {
                        writer.write("{");
                        entries.forEach(({ typeName, selectName }, index) => {
                            writer.write(
                                ` ${getPropertyKey(typeName)}: <const S extends ${selectName}>(selection: S): S => selection`
                            );
                            if (index < entries.length - 1) {
                                writer.write(",");
                            }
                        });
                        writer.write(" }");
                    }
                }
            ]
        };
    }

    private getSelectName(name: FernIr.DeclaredTypeName): string {
        return `${this.case.pascalSafe(name.name)}Select`;
    }

    private getDefaultSelectionName(name: FernIr.DeclaredTypeName): string {
        return `${this.case.pascalSafe(name.name)}DefaultSelection`;
    }

    /**
     * Builds the `<Name>DefaultSelection = { ... } as const` statement for a type that has a Select
     * type. The keys are the type's safe-scalar leaf fields (see {@link getSafeScalarFieldKeys}); a
     * polymorphic/union or scalar-less type falls back to `{ __typename: true }`.
     */
    private generateDefaultSelectionForDeclaration(
        typeDeclaration: FernIr.TypeDeclaration
    ): VariableStatementStructure {
        const defaultSelectionName = this.getDefaultSelectionName(typeDeclaration.name);
        const fieldKeys = typeDeclaration.shape._visit<string[]>({
            object: (object) => this.getSafeScalarFieldKeys(object),
            // Unions select concrete members via `__on`, which is never traversed by the default; their
            // only always-valid leaf is `__typename`.
            union: () => [],
            undiscriminatedUnion: () => [],
            alias: () => [],
            enum: () => [],
            _other: () => []
        });
        return this.buildDefaultSelectionStatement(defaultSelectionName, fieldKeys);
    }

    /**
     * Returns the property keys of an object's safe-scalar leaf fields — the fields where
     * {@link resolveToNamedSelectTarget} yields `undefined` (scalars, enums, literals, maps, unknowns)
     * — never object/list/union relations, and never deprecated fields. Keys are rendered with the same
     * casing as the Select interface so the default const is assignable to it.
     */
    private getSafeScalarFieldKeys(object: FernIr.ObjectTypeDeclaration): string[] {
        const keys: string[] = [];
        for (const property of [...(object.extendedProperties ?? []), ...object.properties]) {
            if (property.availability?.status === FernIr.AvailabilityStatus.Deprecated) {
                continue;
            }
            if (this.resolveToNamedSelectTarget(property.valueType) != null) {
                continue;
            }
            keys.push(this.getPropertyKeyForProperty(property));
        }
        return keys;
    }

    /**
     * Emits `export const <name> = { <key>: true, ... } as const;`. With no safe scalars the object
     * falls back to `{ __typename: true }` so the default is always a valid, non-empty selection.
     */
    private buildDefaultSelectionStatement(name: string, fieldKeys: string[]): VariableStatementStructure {
        const keys = fieldKeys.length > 0 ? fieldKeys : ["__typename"];
        return {
            kind: StructureKind.VariableStatement,
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name,
                    initializer: (writer) => {
                        writer.write("{");
                        keys.forEach((key, index) => {
                            writer.write(` ${getPropertyKey(key)}: true`);
                            if (index < keys.length - 1) {
                                writer.write(",");
                            }
                        });
                        writer.write(" } as const");
                    }
                }
            ]
        };
    }

    /**
     * Reads `ir.graphqlFieldArguments[typeId].fields` structurally so the generator compiles against a
     * published IR that may predate the field. Returns the per-field args map, or `undefined`.
     */
    private getGraphqlFieldArguments(typeId: string): Record<string, GraphqlFieldArgumentShape[]> | undefined {
        const graphqlFieldArguments = (
            this.ir as unknown as {
                graphqlFieldArguments?: Record<string, GraphqlObjectFieldArgumentsShape>;
            }
        ).graphqlFieldArguments;
        return graphqlFieldArguments?.[typeId]?.fields;
    }

    private generateSelectTypeForDeclaration(
        typeDeclaration: FernIr.TypeDeclaration,
        typeId: string,
        argInterfaces: InterfaceDeclarationStructure[]
    ): InterfaceDeclarationStructure | undefined {
        const selectName = this.getSelectName(typeDeclaration.name);
        const fieldArguments = this.getGraphqlFieldArguments(typeId);
        return typeDeclaration.shape._visit<InterfaceDeclarationStructure | undefined>({
            object: (object) =>
                this.generateObjectSelect({
                    selectName,
                    typeName: typeDeclaration.name,
                    object,
                    fieldArguments,
                    argInterfaces
                }),
            union: (union) => this.generateUnionSelect({ selectName, union }),
            undiscriminatedUnion: (union) => this.generateUndiscriminatedUnionSelect({ selectName, union }),
            alias: () => undefined,
            enum: () => undefined,
            _other: () => undefined
        });
    }

    private generateObjectSelect({
        selectName,
        typeName,
        object,
        fieldArguments,
        argInterfaces
    }: {
        selectName: string;
        typeName: FernIr.DeclaredTypeName;
        object: FernIr.ObjectTypeDeclaration;
        fieldArguments: Record<string, GraphqlFieldArgumentShape[]> | undefined;
        argInterfaces: InterfaceDeclarationStructure[];
    }): InterfaceDeclarationStructure {
        const properties: PropertySignatureStructure[] = [];
        // `__typename` is a valid meta-field on every GraphQL object/interface, so expose it on every
        // object Select. It is also the always-valid fallback for the `<Name>DefaultSelection` const
        // when a type has no safe scalars (e.g. a connection wrapper whose fields are all relations).
        properties.push(this.typenameProperty());
        properties.push(this.allProperty());
        for (const property of [...(object.extendedProperties ?? []), ...object.properties]) {
            const fieldWireValue = getWireValue(property.name);
            const args = fieldArguments?.[fieldWireValue];
            let argsTypeName: string | undefined;
            if (args != null && args.length > 0) {
                argsTypeName = this.getArgsTypeName(typeName, property.name);
                argInterfaces.push(this.generateArgsInterface({ argsTypeName, args }));
            }
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.getPropertyKeyForProperty(property)),
                hasQuestionToken: true,
                type: this.getSelectFieldType(property.valueType, argsTypeName),
                // Surface the GraphQL field description as JSDoc so editors show it on hover,
                // making a required `select` discoverable without leaving the call site. A `@deprecated`
                // tag (from the schema's `@deprecated(reason:)`) flags the field at selection time —
                // where the consumer actually opts into fetching it.
                docs: this.getSelectFieldDocs(property)
            });
        }
        return {
            kind: StructureKind.Interface,
            name: selectName,
            isExported: true,
            properties
        };
    }

    /**
     * JSDoc for a field in a Select interface: the GraphQL field description, plus a `@deprecated` tag
     * carrying the schema's `@deprecated(reason:)` when the field is deprecated, so editors flag it at
     * selection time.
     */
    private getSelectFieldDocs(property: FernIr.ObjectProperty): PropertySignatureStructure["docs"] {
        if (property.availability?.status !== FernIr.AvailabilityStatus.Deprecated) {
            return property.docs != null ? [property.docs] : undefined;
        }
        return [
            {
                kind: StructureKind.JSDoc,
                description: property.docs,
                tags: [
                    {
                        kind: StructureKind.JSDocTag,
                        tagName: "deprecated",
                        text: property.availability.message
                    }
                ]
            }
        ];
    }

    /**
     * `<PascalType><PascalField>Args` — the name of the generated arguments interface for a field
     * that carries GraphQL arguments.
     */
    private getArgsTypeName(typeName: FernIr.DeclaredTypeName, fieldName: FernIr.NameAndWireValueOrString): string {
        return `${this.case.pascalSafe(typeName.name)}${this.case.pascalUnsafe(fieldName)}Args`;
    }

    /**
     * Builds the `<Type><Field>Args` interface with one property per GraphQL argument. A property is
     * required only when its GraphQL SDL type ends with `!` (non-null); everything else is optional.
     */
    private generateArgsInterface({
        argsTypeName,
        args
    }: {
        argsTypeName: string;
        args: GraphqlFieldArgumentShape[];
    }): InterfaceDeclarationStructure {
        const properties: PropertySignatureStructure[] = args.map((arg) => {
            const isRequired = arg.graphqlType.trim().endsWith("!");
            return {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.getArgPropertyKey(arg.name)),
                hasQuestionToken: !isRequired,
                type: this.renderArgValueType(arg.valueType),
                docs: arg.docs != null ? [arg.docs] : undefined
            };
        });
        return {
            kind: StructureKind.Interface,
            name: argsTypeName,
            isExported: true,
            properties
        };
    }

    /**
     * Renders a GraphQL argument's value type to a TS type string. Uses the bound type context (when
     * available) so named arg types (enums, input objects) resolve to the SDK's generated types with
     * proper imports. Falls back to `unknown` when no context is threaded.
     *
     * `graphqlFieldArguments` reaches the generator via the IR deserializer's *passthrough* (the
     * compiled-against published IR predates the field), so the nested `valueType` is still in on-disk
     * wire form (`_type` discriminants). Re-parse it through the `TypeReference` schema to obtain the
     * runtime form the type context expects.
     */
    private renderArgValueType(valueType: FernIr.TypeReference): string {
        if (this.typeContext == null) {
            return "unknown";
        }
        const parsedValueType = this.parseArgValueType(valueType);
        return getTextOfTsNode(this.typeContext.getReferenceToType(parsedValueType).typeNode);
    }

    private parseArgValueType(valueType: FernIr.TypeReference): FernIr.TypeReference {
        // Already in runtime form (e.g. when invoked from tests with proper IR objects).
        if (typeof (valueType as { type?: unknown }).type === "string") {
            return valueType;
        }
        return IrSerialization.TypeReference.parseOrThrow(valueType, {
            unrecognizedObjectKeys: "passthrough",
            allowUnrecognizedEnumValues: true,
            allowUnrecognizedUnionMembers: true,
            skipValidation: true
        });
    }

    /**
     * Discriminated unions (Fern `union`) are not part of the GraphQL field-selection model the same
     * way undiscriminated unions are, but they can still appear as response shapes. Treat each member
     * via a `$on` block keyed by the member's discriminant value, plus `__typename`.
     */
    private generateUnionSelect({
        selectName,
        union
    }: {
        selectName: string;
        union: FernIr.UnionTypeDeclaration;
    }): InterfaceDeclarationStructure {
        const onMembers: PropertySignatureStructure[] = [];
        for (const member of union.types) {
            const memberSelect = this.getSingleMemberSelect(member);
            if (memberSelect != null) {
                onMembers.push(memberSelect);
            }
        }
        return this.buildPolymorphicSelect({ selectName, onMembers });
    }

    private getSingleMemberSelect(member: FernIr.SingleUnionType): PropertySignatureStructure | undefined {
        const memberName = this.case.pascalSafe(member.discriminantValue);
        return member.shape._visit<PropertySignatureStructure | undefined>({
            samePropertiesAsObject: (named) => ({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(memberName),
                hasQuestionToken: true,
                type: this.getSelectName(named)
            }),
            singleProperty: () => undefined,
            noProperties: () => undefined,
            _other: () => undefined
        });
    }

    private generateUndiscriminatedUnionSelect({
        selectName,
        union
    }: {
        selectName: string;
        union: FernIr.UndiscriminatedUnionTypeDeclaration;
    }): InterfaceDeclarationStructure {
        const onMembers: PropertySignatureStructure[] = [];
        for (const member of union.members) {
            const named = this.resolveToNamedSelectTarget(member.type);
            if (named != null) {
                const memberName = this.case.pascalSafe(named.name);
                onMembers.push({
                    kind: StructureKind.PropertySignature,
                    name: getPropertyKey(memberName),
                    hasQuestionToken: true,
                    type: this.getSelectName(named)
                });
            }
        }
        return this.buildPolymorphicSelect({ selectName, onMembers });
    }

    private buildPolymorphicSelect({
        selectName,
        onMembers
    }: {
        selectName: string;
        onMembers: PropertySignatureStructure[];
    }): InterfaceDeclarationStructure {
        const properties: PropertySignatureStructure[] = [this.typenameProperty()];
        if (onMembers.length > 0) {
            properties.push({
                kind: StructureKind.PropertySignature,
                name: "__on",
                hasQuestionToken: true,
                type: (writer) => {
                    writer.block(() => {
                        for (const member of onMembers) {
                            writer.writeLine(`${String(member.name)}?: ${String(member.type)};`);
                        }
                    });
                }
            });
        }
        return {
            kind: StructureKind.Interface,
            name: selectName,
            isExported: true,
            properties
        };
    }

    private typenameProperty(): PropertySignatureStructure {
        return {
            kind: StructureKind.PropertySignature,
            name: "__typename",
            hasQuestionToken: true,
            type: "boolean"
        };
    }

    /**
     * `__all?: boolean` — the shorthand selecting every scalar leaf field of the type (PRD §6.3). At
     * runtime it expands to the type's scalar fields; in the result type it pulls in all scalar fields
     * (object relations must still be selected explicitly). Useful at nested levels, where the default
     * selection does not reach.
     */
    private allProperty(): PropertySignatureStructure {
        return {
            kind: StructureKind.PropertySignature,
            name: "__all",
            hasQuestionToken: true,
            type: "boolean"
        };
    }

    /**
     * Computes the TS type for a Select property:
     * - leaf value, no args: `boolean`
     * - leaf value, with args: `boolean | { __args?: <ArgsType> }`
     * - named object/union value, no args: `boolean | <Child>Select`
     * - named object/union value, with args: `boolean | (<Child>Select & { __args?: <ArgsType> })`
     */
    private getSelectFieldType(valueType: FernIr.TypeReference, argsTypeName: string | undefined): string {
        const named = this.resolveToNamedSelectTarget(valueType);
        if (named == null) {
            if (argsTypeName != null) {
                return `boolean | { __args?: ${argsTypeName} }`;
            }
            return "boolean";
        }
        const childSelect = this.getSelectName(named);
        if (argsTypeName != null) {
            return `boolean | (${childSelect} & { __args?: ${argsTypeName} })`;
        }
        return `boolean | ${childSelect}`;
    }

    /**
     * Unwraps optional/list/set/nullable containers and returns the underlying named type *iff* that
     * type has a Select interface (object or undiscriminated/discriminated union). Returns `undefined`
     * for scalars, enums, literals, maps, unknowns, aliases-to-non-named, and self-referential cycles.
     */
    private resolveToNamedSelectTarget(typeReference: FernIr.TypeReference): FernIr.DeclaredTypeName | undefined {
        return typeReference._visit<FernIr.DeclaredTypeName | undefined>({
            container: (container) => this.resolveContainerSelectTarget(container),
            named: (named) => this.resolveNamedSelectTarget(named),
            primitive: () => undefined,
            unknown: () => undefined,
            _other: () => undefined
        });
    }

    private resolveContainerSelectTarget(container: FernIr.ContainerType): FernIr.DeclaredTypeName | undefined {
        return container._visit<FernIr.DeclaredTypeName | undefined>({
            list: (inner) => this.resolveToNamedSelectTarget(inner),
            set: (inner) => this.resolveToNamedSelectTarget(inner),
            optional: (inner) => this.resolveToNamedSelectTarget(inner),
            nullable: (inner) => this.resolveToNamedSelectTarget(inner),
            map: () => undefined,
            literal: () => undefined,
            _other: () => undefined
        });
    }

    private resolveNamedSelectTarget(named: FernIr.DeclaredTypeName): FernIr.DeclaredTypeName | undefined {
        const declaration = this.typeResolver.getTypeDeclarationFromId(named.typeId);
        return declaration.shape._visit<FernIr.DeclaredTypeName | undefined>({
            object: () => declaration.name,
            union: () => declaration.name,
            undiscriminatedUnion: () => declaration.name,
            // Follow aliases to their underlying type; only yields a Select target if the alias
            // ultimately resolves to a named object/union.
            alias: (alias) => this.resolveToNamedSelectTarget(alias.aliasOf),
            enum: () => undefined,
            _other: () => undefined
        });
    }

    private getPropertyKeyForProperty(property: FernIr.ObjectProperty): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return this.case.camelUnsafe(property.name);
        }
        return getWireValue(property.name);
    }

    /**
     * Property key for a GraphQL argument in the generated `$args` interface. Mirrors object-property
     * casing: camelCase when the serde layer is on and original casing is not retained, otherwise the
     * argument's wire value. `arg.name` is a `NameAndWireValueOrString` (the GraphQL importer emits a
     * bare string in the simple case), so it is normalized through the casing helpers directly.
     */
    private getArgPropertyKey(name: FernIr.NameAndWireValueOrString): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return this.case.camelUnsafe(name);
        }
        return getWireValue(name);
    }
}
