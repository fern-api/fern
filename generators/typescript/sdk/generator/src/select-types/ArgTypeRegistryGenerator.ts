import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { TypeResolver } from "@fern-typescript/resolvers";
import { StructureKind, VariableDeclarationKind, VariableStatementStructure, WriterFunction } from "ts-morph";

import { GRAPHQL_ARG_TYPES_EXPORTED_NAME } from "../declaration-referencers/ArgTypeDeclarationReferencer.js";

/**
 * Structural mirror of `FernIr.GraphqlFieldArgument` — see the note in `SelectTypeGenerator`.
 * Generators compile against the published `@fern-fern/ir-sdk`, which may predate the IR change that
 * adds `graphqlFieldArguments`.
 */
interface GraphqlFieldArgumentShape {
    name: FernIr.NameAndWireValueOrString;
    valueType: FernIr.TypeReference;
    graphqlType: string;
    docs?: string;
}

interface GraphqlObjectFieldArgumentsShape {
    fields: Record<string, GraphqlFieldArgumentShape[]>;
}

interface FieldRegistryEntry {
    /** Child GraphQL type name, for descending the selection. */
    type?: string;
    /** Argument wire name → GraphQL SDL type string, for declaring the variable. */
    args?: Record<string, string>;
}

export declare namespace ArgTypeRegistryGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        typeResolver: TypeResolver;
        caseConverter: CaseConverter;
    }
}

/**
 * Generates the GraphQL arg-type registry const (`GRAPHQL_ARG_TYPES`), a runtime lookup keyed by
 * GraphQL type name → field wire name → `{ type?, args? }`. `buildGraphqlQuery` walks the caller's
 * selection against this registry to (a) resolve nested `$args` SDL types into GraphQL variables and
 * (b) descend into child types as it recurses.
 *
 * Type-name keys use the PascalCase of the IR type name, matching the GraphQL SDL type names the
 * importer produced and the `rootType` derived at each operation's call site. Every object/interface/
 * union type is included so the runtime can always descend a selection; entries with neither a child
 * `type` nor `args` are still emitted (cheaply) for completeness.
 */
export class ArgTypeRegistryGenerator {
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly typeResolver: TypeResolver;
    private readonly case: CaseConverter;

    constructor({ ir, typeResolver, caseConverter }: ArgTypeRegistryGenerator.Init) {
        this.ir = ir;
        this.typeResolver = typeResolver;
        this.case = caseConverter;
    }

    /** Builds the `export const GRAPHQL_ARG_TYPES = { ... }` statement, or `undefined` if empty. */
    public generateStatement(): VariableStatementStructure | undefined {
        const registry: Record<string, Record<string, FieldRegistryEntry>> = {};
        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            const fields = this.buildFieldsForType(typeId, typeDeclaration);
            if (fields != null) {
                registry[this.getGraphqlTypeName(typeDeclaration.name)] = fields;
            }
        }
        if (Object.keys(registry).length === 0) {
            return undefined;
        }
        return {
            kind: StructureKind.VariableStatement,
            isExported: true,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: GRAPHQL_ARG_TYPES_EXPORTED_NAME,
                    type: "Record<string, Record<string, { type?: string; args?: Record<string, string> }>>",
                    initializer: this.writeRegistry(registry)
                }
            ]
        };
    }

    private getGraphqlTypeName(name: FernIr.DeclaredTypeName): string {
        return this.case.pascalSafe(name.name);
    }

    /**
     * Builds the field map for an object/interface type, or returns `undefined` for types that have no
     * selectable fields (aliases, enums, scalars, unions — unions descend via `$on` fragments whose
     * concrete-type keys are themselves registry entries, so the union node itself needs no fields).
     */
    private buildFieldsForType(
        typeId: string,
        typeDeclaration: FernIr.TypeDeclaration
    ): Record<string, FieldRegistryEntry> | undefined {
        return typeDeclaration.shape._visit<Record<string, FieldRegistryEntry> | undefined>({
            object: (object) => this.buildObjectFields(typeId, object),
            // Unions still need an entry so the runtime can land on them, but their selectable fields
            // are reached through `$on` fragments (keyed by concrete type), so emit an empty field map.
            union: () => ({}),
            undiscriminatedUnion: () => ({}),
            alias: () => undefined,
            enum: () => undefined,
            _other: () => undefined
        });
    }

    private buildObjectFields(
        typeId: string,
        object: FernIr.ObjectTypeDeclaration
    ): Record<string, FieldRegistryEntry> {
        const fieldArguments = this.getGraphqlFieldArguments(typeId);
        const fields: Record<string, FieldRegistryEntry> = {};
        for (const property of [...(object.extendedProperties ?? []), ...object.properties]) {
            const fieldWireValue = getWireValue(property.name);
            const entry: FieldRegistryEntry = {};
            const childType = this.resolveChildTypeName(property.valueType);
            if (childType != null) {
                entry.type = childType;
            }
            const args = fieldArguments?.[fieldWireValue];
            if (args != null && args.length > 0) {
                entry.args = {};
                for (const arg of args) {
                    entry.args[getWireValue(arg.name)] = arg.graphqlType;
                }
            }
            // Emit every field, including scalar leaves with neither a child `type` nor `args` (as `{}`),
            // so the registry is a complete field map: `buildGraphqlQuery` expands `__all` to the type's
            // scalar fields (those with no `type`) directly from it, no separate registry needed.
            fields[fieldWireValue] = entry;
        }
        return fields;
    }

    /** Reads `ir.graphqlFieldArguments[typeId].fields` structurally (published IR may predate it). */
    private getGraphqlFieldArguments(typeId: string): Record<string, GraphqlFieldArgumentShape[]> | undefined {
        const graphqlFieldArguments = (
            this.ir as unknown as {
                graphqlFieldArguments?: Record<string, GraphqlObjectFieldArgumentsShape>;
            }
        ).graphqlFieldArguments;
        return graphqlFieldArguments?.[typeId]?.fields;
    }

    /**
     * Resolves a (possibly container-wrapped) field value type to the GraphQL type name of its
     * underlying named object/interface/union, for selection descent. Returns `undefined` for
     * scalars/enums/maps/etc.
     */
    private resolveChildTypeName(typeReference: FernIr.TypeReference): string | undefined {
        const named = this.resolveToNamedTarget(typeReference);
        return named != null ? this.getGraphqlTypeName(named) : undefined;
    }

    private resolveToNamedTarget(typeReference: FernIr.TypeReference): FernIr.DeclaredTypeName | undefined {
        return typeReference._visit<FernIr.DeclaredTypeName | undefined>({
            container: (container) =>
                container._visit<FernIr.DeclaredTypeName | undefined>({
                    list: (inner) => this.resolveToNamedTarget(inner),
                    set: (inner) => this.resolveToNamedTarget(inner),
                    optional: (inner) => this.resolveToNamedTarget(inner),
                    nullable: (inner) => this.resolveToNamedTarget(inner),
                    map: () => undefined,
                    literal: () => undefined,
                    _other: () => undefined
                }),
            named: (named) => {
                const declaration = this.typeResolver.getTypeDeclarationFromId(named.typeId);
                return declaration.shape._visit<FernIr.DeclaredTypeName | undefined>({
                    object: () => declaration.name,
                    union: () => declaration.name,
                    undiscriminatedUnion: () => declaration.name,
                    alias: (alias) => this.resolveToNamedTarget(alias.aliasOf),
                    enum: () => undefined,
                    _other: () => undefined
                });
            },
            primitive: () => undefined,
            unknown: () => undefined,
            _other: () => undefined
        });
    }

    private writeRegistry(registry: Record<string, Record<string, FieldRegistryEntry>>): WriterFunction {
        return (writer) => {
            writer.inlineBlock(() => {
                for (const [typeName, fields] of Object.entries(registry)) {
                    writer.write(`${JSON.stringify(typeName)}: `);
                    writer.inlineBlock(() => {
                        for (const [fieldName, entry] of Object.entries(fields)) {
                            writer.writeLine(`${JSON.stringify(fieldName)}: ${JSON.stringify(entry)},`);
                        }
                    });
                    writer.write(",");
                    writer.newLine();
                }
            });
        };
    }
}
