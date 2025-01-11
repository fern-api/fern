import { format } from "util";

import {
    AliasTypeDeclaration,
    ContainerType,
    DeclaredTypeName,
    EnumTypeDeclaration,
    EnumValue,
    Literal,
    MapType,
    ObjectTypeDeclaration,
    PrimitiveType,
    ResolvedNamedType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { LocationGenerator } from "../../utils/LocationGenerator";
import { Argument } from "../Argument";
import { Import } from "../Import";
import { Property } from "../Property";
import { Variable } from "../Variable";
import { ConditionalStatement } from "../abstractions/ConditionalStatement";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";

enum RubyClass {
    INTEGER = "Integer",
    DOUBLE = "Float",
    STRING = "String",
    BOOLEAN = "Boolean",
    LONG = "Long",
    TIME = "Time",
    DATETIME = "DateTime",
    DATE = "Date",
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    UUID = "String",
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    BASE64 = "String",
    OBJECT = "Object",
    JSON = "JSON",
    OPENSTRUCT = "OpenStruct",
    VOID = "Void",
    FILE = "IO",
    METHOD = "Method"
}

export declare namespace ClassReference {
    export interface Init extends AstNode.Init {
        name: string;
        typeHint?: string;
        resolvedTypeId?: TypeId;
        import_?: Import;
        moduleBreadcrumbs?: string[];
    }
}

export class ClassReference extends AstNode {
    public name: string;
    public typeHint: string;
    public resolvedTypeId: TypeId | undefined;
    public qualifiedName: string;
    public import_: Import | undefined;

    constructor({
        name,
        typeHint,
        import_,
        location,
        moduleBreadcrumbs,
        resolvedTypeId,
        ...rest
    }: ClassReference.Init) {
        super(rest);
        this.name = name;
        this.import_ = import_;

        this.qualifiedName = [...(moduleBreadcrumbs ?? []), name].join("::");
        this.typeHint = typeHint ?? this.qualifiedName;
        this.resolvedTypeId = resolvedTypeId;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.qualifiedName, startingTabSpaces });
    }

    public fromJson(_variable: Variable | string): AstNode | undefined {
        return;
    }

    // This creates a function meant to validate a variable holding the raw version of this class
    // for objects that would be a hash, for primitives it is the outright type, so is_a? is the default
    public validateRaw(variable: Variable | string, isOptional = false): FunctionInvocation | Expression {
        const fi = new FunctionInvocation({
            baseFunction: new Function_({ name: "is_a?", functionBody: [] }),
            onObject: variable,
            arguments_: [new Argument({ value: this.qualifiedName, isNamed: false })],
            optionalSafeCall: isOptional
        });
        return new Expression({
            leftSide: new Expression({
                leftSide: fi,
                rightSide: "false",
                operation: "!=",
                isAssignment: false
            }),
            rightSide: `raise("Passed value for field ${
                variable instanceof Variable ? variable.name : variable
            } is not the expected type, validation failed.")`,
            operation: "||",
            isAssignment: false
        });
    }

    public getImports(): Set<Import> {
        return new Set(this.import_ ? [this.import_] : []);
    }
}

// Basic or primitve class references for which we don't do much
export const OpenStructClassReference = new ClassReference({
    name: RubyClass.OPENSTRUCT,
    import_: new Import({ from: "ostruct", isExternal: true })
});
export const GenericClassReference = new ClassReference({ name: RubyClass.OBJECT });
export const JsonClassReference = new ClassReference({
    name: RubyClass.JSON,
    import_: new Import({ from: "json", isExternal: true })
});
export const VoidClassReference = new ClassReference({ name: RubyClass.VOID });
export const BooleanClassReference = new ClassReference({ name: RubyClass.BOOLEAN });
export const StringClassReference = new ClassReference({ name: RubyClass.STRING });
export const MethodClassReference = new ClassReference({ name: RubyClass.METHOD });
export const LongClassReference = new ClassReference({ name: RubyClass.LONG });
export const FileClassReference = new ClassReference({ name: RubyClass.FILE });
export const B64StringClassReference = new ClassReference({ name: RubyClass.BASE64 });
export const TimeClassReference = new ClassReference({ name: RubyClass.TIME });
export const NilValue = "nil";
export const OmittedValue = "OMIT";

export class LiteralClassReference extends ClassReference {
    innerType: ClassReference;
    value: string;

    constructor(innerType: ClassReference, lit: Literal) {
        super({ ...innerType });
        this.innerType = innerType;
        this.value = lit._visit<string>({
            string: (s) => `"${s}"`,
            boolean: (b) => (b ? "true" : "false"),
            _other: () => {
                throw new Error("Unexpected literal type");
            }
        });
    }

    public getLiteralValue(): string {
        return this.value;
    }
}

// Extended class references
export declare namespace SerializableObjectReference {
    export interface InitReference extends ClassReference.Init {
        properties: Map<string, TypeReference>;
    }
}
export class SerializableObjectReference extends ClassReference {
    properties: Map<string, TypeReference>;

    constructor({ properties, ...rest }: SerializableObjectReference.InitReference) {
        super({ ...rest });
        this.properties = properties;
    }

    public fromJson(variable: string | Variable): AstNode | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "from_json", functionBody: [] }),
            onObject: this.qualifiedName,
            arguments_: [new Argument({ value: variable, isNamed: true, name: "json_object" })]
        });
    }

    public validateRaw(variable: Variable | string, isOptional = false): FunctionInvocation | Expression {
        const fi = new FunctionInvocation({
            baseFunction: new Function_({ name: "validate_raw", functionBody: [] }),
            // Recreate the variable to force isOptional to raise if a required variable is optional
            onObject: this,
            arguments_: [new Argument({ value: variable, isNamed: true, name: "obj" })]
        });

        return !isOptional
            ? fi
            : new Expression({
                  leftSide: new FunctionInvocation({
                      baseFunction: new Function_({ name: "nil?", functionBody: [] }),
                      // Recreate the variable to force isOptional to raise if a required variable is optional
                      onObject: variable,
                      optionalSafeCall: false
                  }),
                  rightSide: fi,
                  operation: "||",
                  isAssignment: false
              });
    }

    static fromDeclaredTypeName(
        declaredTypeName: DeclaredTypeName,
        locationGenerator: LocationGenerator,
        properties: Map<string, TypeReference>
    ): ClassReference {
        const location = locationGenerator.getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = locationGenerator.getModuleBreadcrumbs({
            path: declaredTypeName.fernFilepath,
            includeFilename: true,
            isType: true
        });
        return new SerializableObjectReference({
            name: declaredTypeName.name.pascalCase.safeName,
            import_: new Import({ from: location }),
            moduleBreadcrumbs,
            resolvedTypeId: declaredTypeName.typeId,
            properties
        });
    }
}

export declare namespace DiscriminatedUnionClassReference {
    export type InitReference = SerializableObjectReference.InitReference;
}
export class DiscriminatedUnionClassReference extends SerializableObjectReference {
    constructor(init: DiscriminatedUnionClassReference.InitReference) {
        super({ ...init });
    }

    static fromDeclaredTypeName(
        declaredTypeName: DeclaredTypeName,
        locationGenerator: LocationGenerator,
        properties: Map<string, TypeReference>
    ): ClassReference {
        const location = locationGenerator.getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = locationGenerator.getModuleBreadcrumbs({
            path: declaredTypeName.fernFilepath,
            includeFilename: true,
            isType: true
        });
        return new DiscriminatedUnionClassReference({
            name: declaredTypeName.name.pascalCase.safeName,
            import_: new Import({ from: location }),
            moduleBreadcrumbs,
            resolvedTypeId: declaredTypeName.typeId,
            properties
        });
    }
}

export declare namespace AliasReference {
    export interface Init extends ClassReference.Init {
        aliasOf: ClassReference;
    }
}
export class AliasReference extends ClassReference {
    public aliasOf: ClassReference;
    constructor({ aliasOf, ...rest }: AliasReference.Init) {
        super(rest);
        this.aliasOf = aliasOf;
    }

    public fromJson(variable: string | Variable): AstNode | undefined {
        return this.aliasOf.fromJson(variable);
    }

    public validateRaw(variable: string | Variable, isOptional?: boolean): FunctionInvocation | Expression {
        return this.aliasOf.validateRaw(variable, isOptional);
    }

    static fromDeclaredTypeName(
        declaredTypeName: DeclaredTypeName,
        aliasOf: ClassReference,
        resolvedTypeId: string | undefined,
        locationGenerator: LocationGenerator
    ): ClassReference {
        const location = locationGenerator.getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = locationGenerator.getModuleBreadcrumbs({
            path: declaredTypeName.fernFilepath,
            includeFilename: true,
            isType: true
        });
        return new AliasReference({
            aliasOf,
            name: declaredTypeName.name.screamingSnakeCase.safeName,
            import_: new Import({ from: location }),
            moduleBreadcrumbs,
            resolvedTypeId
        });
    }
}

export declare namespace ArrayReference {
    export interface InitReference extends AstNode.Init {
        innerType: ClassReference | string;
    }
    export interface InitInstance extends AstNode.Init {
        contents?: (AstNode | string)[];
    }
}
export class ArrayReference extends ClassReference {
    public innerType: ClassReference | string;
    constructor({ innerType, ...rest }: ArrayReference.InitReference) {
        const typeName = innerType instanceof ClassReference ? innerType.typeHint : innerType;
        super({
            name: "Array",
            typeHint: `Array<${typeName}>`,
            import_: innerType instanceof ClassReference ? innerType.import_ : undefined,
            ...rest
        });

        this.innerType = innerType;
    }

    public fromJson(variable: string | Variable): AstNode | undefined {
        const valueFromJsonFunction =
            this.innerType instanceof ClassReference ? this.innerType.fromJson("item") : undefined;

        // If the nested value is iterable, then you should not cast the item back to JSON, but rather allow it to
        // remain iterable and the nested value will be responsible for casting itself back to JSON
        const valueIsIterable = this.innerType instanceof ArrayReference || this.innerType instanceof HashReference;
        const expressions = [];
        if (!valueIsIterable) {
            expressions.push(
                new Expression({
                    leftSide: "item",
                    rightSide: new FunctionInvocation({
                        onObject: "item",
                        baseFunction: new Function_({ name: "to_json", functionBody: [] })
                    }),
                    isAssignment: true
                })
            );
        }
        expressions.push(new Expression({ rightSide: valueFromJsonFunction, isAssignment: false }));

        return valueFromJsonFunction !== undefined
            ? new FunctionInvocation({
                  baseFunction: new Function_({ name: "map", functionBody: [] }),
                  onObject: variable,
                  optionalSafeCall: true,
                  block: {
                      arguments: "item",
                      expressions
                  }
              })
            : undefined;
    }
}

export class ArrayInstance extends AstNode {
    public contents: (AstNode | string)[];
    constructor({ contents = [], ...rest }: ArrayReference.InitInstance) {
        super(rest);
        this.contents = contents;
    }

    public writeInternal(): void {
        this.addText({
            stringContent:
                this.contents.length > 0
                    ? this.contents.map((c) => (c instanceof AstNode ? c.write({}) : c)).join(", ")
                    : undefined,
            templateString: "[%s]"
        });
    }
}

export declare namespace Hash_ {
    export interface InitReference extends Omit<ClassReference.Init, "name" | "typeHint"> {
        name?: string;
        typeHint?: string;
        keyType: ClassReference | string;
        valueType: ClassReference | string;
    }
    export interface InitInstance extends AstNode.Init {
        contents?: Map<string, string | AstNode>;
        // allow for spreading additional hashes into this hash.
        additionalHashes?: DefaultingExpandableHash[];
        isFrozen?: boolean;
        shouldCompact?: boolean;
        stringifyValues?: boolean;
    }
}
export class HashReference extends ClassReference {
    valueType: ClassReference | string;
    constructor({ name, typeHint, keyType, valueType, ...rest }: Hash_.InitReference) {
        const keyTypeName = keyType instanceof ClassReference ? keyType.qualifiedName : keyType;
        const valueTypeName = valueType instanceof ClassReference ? valueType.qualifiedName : valueType;
        const typeHintDefaulted = typeHint ?? `Hash{${keyTypeName} => ${valueTypeName}}`;
        const nameDefaulted = name ?? "Hash";
        super({ name: nameDefaulted, typeHint: typeHintDefaulted, ...rest });

        this.valueType = valueType;
    }
    public fromJson(variable: string | Variable): AstNode | undefined {
        const valueFromJsonFunction =
            this.valueType instanceof ClassReference ? this.valueType.fromJson("value") : undefined;

        // If the nested value is iterable, then you should not cast the item back to JSON, but rather allow it to
        // remain iterable and the nested value will be responsible for casting itself back to JSON
        const valueIsIterable = this.valueType instanceof ArrayReference || this.valueType instanceof HashReference;
        const expressions = [];
        if (!valueIsIterable) {
            expressions.push(
                new Expression({
                    leftSide: "value",
                    rightSide: new FunctionInvocation({
                        onObject: "value",
                        baseFunction: new Function_({ name: "to_json", functionBody: [] })
                    }),
                    isAssignment: true
                })
            );
        }
        expressions.push(new Expression({ rightSide: valueFromJsonFunction, isAssignment: false }));

        return valueFromJsonFunction !== undefined
            ? new FunctionInvocation({
                  baseFunction: new Function_({ name: "transform_values", functionBody: [] }),
                  onObject: variable,
                  optionalSafeCall: true,
                  block: {
                      arguments: "value",
                      expressions
                  }
              })
            : undefined;
    }
}

interface DefaultingExpandableHash {
    value: AstNode | string;
    defaultValue?: AstNode | string;
}

export class HashInstance extends AstNode {
    public contents: Map<string, string | AstNode>;
    public additionalHashes: DefaultingExpandableHash[];
    public shouldCompact: boolean;
    public isFrozen: boolean;
    public stringifyValues: boolean;

    constructor({
        contents = new Map(),
        isFrozen = false,
        shouldCompact = false,
        additionalHashes = [],
        stringifyValues = true,
        ...rest
    }: Hash_.InitInstance) {
        super(rest);

        this.contents = contents;
        this.isFrozen = isFrozen;
        this.shouldCompact = shouldCompact;
        this.additionalHashes = additionalHashes;
        this.stringifyValues = stringifyValues;
    }

    public writeInternal(): void {
        const hashContents = Array.from(this.contents.entries());
        const expandingHashes = this.additionalHashes
            .map((ah) => {
                const hashString = ah.value instanceof AstNode ? ah.value.write({}) : ah.value;
                return ah.defaultValue !== undefined
                    ? format(
                          "**(%s || %s)",
                          hashString,
                          ah.defaultValue instanceof AstNode ? ah.defaultValue.write({}) : ah.defaultValue
                      )
                    : format("**%s", hashString);
            })
            .join(", ");
        this.addText({
            stringContent: `{ ${expandingHashes}${
                hashContents.length > 0 && this.additionalHashes.length > 0 ? ", " : ""
            }${hashContents
                .map(([k, v]) => k + ": " + (v instanceof AstNode ? v.write({}) : this.stringifyValues ? `'${v}'` : v))
                .join(", ")} }`
        });
        this.addText({ stringContent: this.shouldCompact ? ".compact" : undefined, appendToLastString: true });
        this.addText({ stringContent: this.isFrozen ? ".freeze" : undefined, appendToLastString: true });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        Array.from(this.contents.values()).forEach((param) => {
            if (param instanceof AstNode) {
                imports = new Set([...imports, ...param.getImports()]);
            }
        });
        this.additionalHashes.forEach((ah) => {
            if (ah.value instanceof AstNode) {
                imports = new Set([...imports, ...ah.value.getImports()]);
            }
            if (ah.defaultValue instanceof AstNode) {
                imports = new Set([...imports, ...ah.defaultValue.getImports()]);
            }
        });
        return imports;
    }
}

export declare namespace EnumReference {
    export interface Init extends ClassReference.Init {
        values: EnumValue[];
    }
}

export class EnumReference extends ClassReference {
    public values: EnumValue[];
    constructor({ values, ...rest }: EnumReference.Init) {
        super({ ...rest });
        this.values = values;
    }

    static fromDeclaredTypeName(
        declaredTypeName: DeclaredTypeName,
        locationGenerator: LocationGenerator,
        enumValues: EnumValue[]
    ): EnumReference {
        const location = locationGenerator.getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = locationGenerator.getModuleBreadcrumbs({
            path: declaredTypeName.fernFilepath,
            includeFilename: true,
            isType: true
        });
        return new EnumReference({
            name: declaredTypeName.name.pascalCase.safeName,
            import_: new Import({ from: location }),
            moduleBreadcrumbs,
            values: enumValues
        });
    }
}

export declare namespace Set_ {
    export interface InitReference extends AstNode.Init {
        innerType: ClassReference | string;
    }
    export interface InitInstance extends AstNode.Init {
        contents?: (AstNode | string)[];
    }
}
export class SetReference extends ClassReference {
    private innerType: ClassReference | string;

    constructor({ innerType, ...rest }: Set_.InitReference) {
        const typeName = innerType instanceof ClassReference ? innerType.qualifiedName : innerType;
        super({
            name: "Set",
            typeHint: `Set<${typeName}>`,
            import_: new Import({ from: "set", isExternal: true }),
            ...rest
        });

        this.innerType = innerType;
    }

    public fromJson(variable: Variable | string): AstNode | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "new", functionBody: [] }),
            onObject: new ClassReference({ name: "Set", import_: new Import({ from: "set", isExternal: true }) }),
            arguments_: [new Argument({ value: variable, isNamed: false })]
        });
    }
}

export class SetInstance extends AstNode {
    public contents: (AstNode | string)[];
    constructor({ contents = [], ...rest }: Set_.InitInstance) {
        super(rest);
        this.contents = contents;
    }

    public writeInternal(): void {
        this.addText({
            stringContent:
                this.contents.length > 0
                    ? this.contents.map((c) => (c instanceof AstNode ? c.write({}) : c)).join(", ")
                    : undefined,
            templateString: "Set[%s]"
        });
    }
}

export declare namespace DateReference {
    export interface DateTimeInit extends AstNode.Init {
        readonly type: "DateTime";
    }
    export interface DateInit extends AstNode.Init {
        readonly type: "Date";
    }
}
export class DateReference extends ClassReference {
    constructor({ type, ...rest }: DateReference.DateTimeInit | DateReference.DateInit) {
        super({
            name: type === "Date" ? RubyClass.DATE : RubyClass.DATETIME,
            import_: new Import({ from: "date", isExternal: true }),
            ...rest
        });
    }

    public fromJson(variable: Variable | string): AstNode | undefined {
        return new ConditionalStatement({
            if_: {
                rightSide: new FunctionInvocation({
                    // TODO: Do this field access on the client better
                    onObject: variable,
                    baseFunction: new Function_({ name: "nil?", functionBody: [] })
                }),
                operation: "!",
                expressions: [
                    new FunctionInvocation({
                        baseFunction: new Function_({ name: "parse", functionBody: [] }),
                        onObject: this,
                        arguments_: [new Argument({ value: variable, isNamed: false })]
                    })
                ]
            },
            else_: [new Expression({ rightSide: "nil", isAssignment: false })]
        });
    }
}

export class ClassReferenceFactory {
    private locationGenerator: LocationGenerator;
    private typeDeclarations: Map<TypeId, TypeDeclaration>;
    private typeReferenceToClass: Map<TypeReference, ClassReference>;

    public generatedReferences: Map<TypeId, ClassReference>;

    public resolvedReferences: Map<TypeId, ClassReference[]>;

    constructor(typeDeclarations: Map<TypeId, TypeDeclaration>, locationGenerator: LocationGenerator) {
        this.locationGenerator = locationGenerator;
        this.typeDeclarations = typeDeclarations;
        this.generatedReferences = new Map();
        this.resolvedReferences = new Map();
        this.typeReferenceToClass = new Map();
        for (const [_, type] of typeDeclarations) {
            this.fromTypeDeclaration(type);
        }
    }

    public fromTypeDeclaration(type: TypeDeclaration): ClassReference {
        const typeId = type.name.typeId;
        let cr = this.generatedReferences.get(typeId);
        if (cr === undefined) {
            cr = type.shape._visit<ClassReference>({
                alias: (atd: AliasTypeDeclaration) => {
                    const aliasOfCr = this.fromTypeReference(atd.aliasOf);
                    let preferredClassReference = undefined;
                    const resolvedTypeId = atd.resolvedType._visit<TypeId | undefined>({
                        named: (rnt: ResolvedNamedType) => rnt.name.typeId,
                        container: (ct) => this.forContainerType(ct).resolvedTypeId,
                        primitive: (pt) => {
                            preferredClassReference = this.forPrimitiveType(pt);
                            return preferredClassReference.resolvedTypeId;
                        },
                        unknown: () => undefined,
                        _other: () => undefined
                    });
                    return preferredClassReference != null
                        ? preferredClassReference
                        : AliasReference.fromDeclaredTypeName(
                              type.name,
                              aliasOfCr,
                              resolvedTypeId,
                              this.locationGenerator
                          );
                },
                enum: (etd: EnumTypeDeclaration) =>
                    EnumReference.fromDeclaredTypeName(type.name, this.locationGenerator, etd.values),
                object: (otd: ObjectTypeDeclaration) => {
                    const properties = new Map(
                        otd.properties.map((prop) => [Property.getNameFromIr(prop.name.name), prop.valueType])
                    );
                    return SerializableObjectReference.fromDeclaredTypeName(
                        type.name,
                        this.locationGenerator,
                        properties
                    );
                },
                // TODO: improve discriminated union codegen
                union: () =>
                    DiscriminatedUnionClassReference.fromDeclaredTypeName(type.name, this.locationGenerator, new Map()),
                undiscriminatedUnion: (uutd: UndiscriminatedUnionTypeDeclaration) => {
                    this.resolvedReferences.set(
                        typeId,
                        uutd.members.map((member) => this.fromTypeReference(member.type))
                    );

                    // This should essentially never be used.
                    return SerializableObjectReference.fromDeclaredTypeName(
                        type.name,
                        this.locationGenerator,
                        // Undiscriminated unions boil down to type hints of the union members
                        // so there's no need to provide properties, the right ClassReferences will
                        // be retrieved from the type hint.
                        new Map()
                    );
                },
                _other: () => {
                    throw new Error("Attempting to generate a class reference for an unknown type.");
                }
            });
            this.generatedReferences.set(typeId, cr);
        }
        return cr;
    }

    public fromDeclaredTypeName(declaredTypeName: DeclaredTypeName): ClassReference {
        let cr = this.generatedReferences.get(declaredTypeName.typeId);
        // Likely you care attempting to generate an alias and the aliased class has not yet been created.
        // Create it now!
        if (cr === undefined) {
            const td = this.typeDeclarations.get(declaredTypeName.typeId);
            if (td !== undefined) {
                cr = this.fromTypeDeclaration(td);
                this.generatedReferences.set(declaredTypeName.typeId, cr);
            } else {
                throw new Error("ClassReference requested does not exist");
            }
        }
        return cr;
    }

    public fromTypeReference(typeReference: TypeReference): ClassReference {
        let cr = this.typeReferenceToClass.get(typeReference);
        if (cr != null) {
            return cr;
        }
        cr = typeReference._visit<ClassReference>({
            container: (ct) => this.forContainerType(ct),
            named: (dtn) => this.fromDeclaredTypeName(dtn),
            primitive: (pt) => this.forPrimitiveType(pt),
            _other: (value: { type: string }) => new ClassReference({ name: value.type }),
            unknown: () => GenericClassReference
        });
        this.typeReferenceToClass.set(typeReference, cr);
        return cr;
    }

    private forPrimitiveType(primitive: PrimitiveType): ClassReference {
        return PrimitiveType._visit<ClassReference>(primitive, {
            integer: () => new ClassReference({ name: RubyClass.INTEGER }),
            double: () => new ClassReference({ name: RubyClass.DOUBLE }),
            string: () => StringClassReference,
            boolean: () => BooleanClassReference,
            long: () => new ClassReference({ name: RubyClass.LONG }),
            dateTime: () => new DateReference({ type: "DateTime" }),
            date: () => new DateReference({ type: "Date" }),
            uuid: () => new ClassReference({ name: RubyClass.UUID }),
            base64: () => B64StringClassReference,
            _other: () => {
                throw new Error("Unexpected primitive type: " + primitive);
            }
        });
    }

    private forContainerType(containerType: ContainerType): ClassReference {
        return containerType._visit<ClassReference>({
            list: (tr: TypeReference) => new ArrayReference({ innerType: this.fromTypeReference(tr) }),
            map: (mt: MapType) =>
                new HashReference({
                    keyType: this.fromTypeReference(mt.keyType),
                    valueType: this.fromTypeReference(mt.valueType)
                }),
            // Optional types in Ruby look the same except they're defaulted to nil in signatures.
            optional: (tr: TypeReference) => this.fromTypeReference(tr),
            set: (tr: TypeReference) => new SetReference({ innerType: this.fromTypeReference(tr) }),
            literal: (lit: Literal) =>
                new LiteralClassReference(
                    Literal._visit<ClassReference>(lit, {
                        string: () => StringClassReference,
                        boolean: () => BooleanClassReference,
                        _other: (value: { type: string }) => new ClassReference({ name: value.type })
                    }),
                    lit
                ),
            _other: () => {
                throw new Error("Unexpected primitive type: " + containerType.type);
            }
        });
    }

    public classReferenceFromUnionType(
        singleUnionTypeProperties: SingleUnionTypeProperties
    ): ClassReference | undefined {
        return singleUnionTypeProperties._visit<ClassReference | undefined>({
            samePropertiesAsObject: (dtn) => this.fromDeclaredTypeName(dtn),
            singleProperty: (sutp: SingleUnionTypeProperty) => this.fromTypeReference(sutp.type),
            noProperties: () => undefined,
            _other: () => {
                throw new Error();
            }
        });
    }
}
