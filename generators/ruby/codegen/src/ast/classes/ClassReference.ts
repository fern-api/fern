import {
    AliasTypeDeclaration,
    ContainerType,
    DeclaredTypeName,
    Literal,
    MapType,
    PrimitiveType,
    ResolvedNamedType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { format } from "util";
import { LocationGenerator } from "../../utils/LocationGenerator";
import { ConditionalStatement } from "../abstractions/ConditionalStatement";
import { Argument } from "../Argument";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { Import } from "../Import";
import { Module_ } from "../Module_";
import { Variable } from "../Variable";

enum RubyClass {
    INTEGER = "Integer",
    DOUBLE = "Float",
    STRING = "String",
    BOOLEAN = "Boolean",
    LONG = "Long",
    DATETIME = "DateTime",
    DATE = "Date",
    UUID = "UUID",
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    BASE64 = "String",
    OBJECT = "Object",
    JSON = "JSON",
    OPENSTRUCT = "OpenStruct",
    VOID = "Void",
    FILE = "IO"
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
            arguments_: [new Argument({ value: this.qualifiedName, isNamed: false, type: GenericClassReference })],
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

export const OpenStructClassReference = new ClassReference({ name: RubyClass.OPENSTRUCT });
export const GenericClassReference = new ClassReference({ name: RubyClass.OBJECT });
export const JsonClassReference = new ClassReference({
    name: RubyClass.JSON,
    import_: new Import({ from: "json", isExternal: true })
});
export const VoidClassReference = new ClassReference({ name: RubyClass.VOID });
export const BooleanClassReference = new ClassReference({ name: RubyClass.BOOLEAN });
export const StringClassReference = new ClassReference({ name: RubyClass.STRING });
export const LongClassReference = new ClassReference({ name: RubyClass.LONG });
export const FileClassReference = new ClassReference({ name: RubyClass.FILE });
export const B64StringClassReference = new ClassReference({ name: RubyClass.BASE64 });
export const NilValue = "nil";

export declare namespace SerializableObjectReference {
    export type InitReference = ClassReference.Init;
}
export class SerializableObjectReference extends ClassReference {
    constructor(init: SerializableObjectReference.InitReference) {
        super({ ...init });
    }

    public fromJson(variable: string | Variable): AstNode | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "from_json", functionBody: [] }),
            onObject: this.qualifiedName,
            arguments_: [
                new Argument({ type: GenericClassReference, value: variable, isNamed: true, name: "json_object" })
            ]
        });
    }

    public validateRaw(variable: Variable | string, isOptional = false): FunctionInvocation | Expression {
        const fi = new FunctionInvocation({
            baseFunction: new Function_({ name: "validate_raw", functionBody: [] }),
            // Recreate the variable to force isOptional to raise if a required variable is optional
            onObject: this,
            arguments_: [new Argument({ value: variable, isNamed: true, name: "obj", type: GenericClassReference })]
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
        locationGenerator: LocationGenerator
    ): ClassReference {
        const location = locationGenerator.getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = Module_.getModuleBreadcrumbs(declaredTypeName.fernFilepath, true);
        return new SerializableObjectReference({
            name: declaredTypeName.name.pascalCase.safeName,
            import_: new Import({ from: location }),
            moduleBreadcrumbs,
            resolvedTypeId: declaredTypeName.typeId
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
        locationGenerator: LocationGenerator
    ): ClassReference {
        const location = locationGenerator.getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = Module_.getModuleBreadcrumbs(declaredTypeName.fernFilepath, true);
        return new DiscriminatedUnionClassReference({
            name: declaredTypeName.name.pascalCase.safeName,
            import_: new Import({ from: location }),
            moduleBreadcrumbs,
            resolvedTypeId: declaredTypeName.typeId
        });
    }
}

export declare namespace AliasReference {
    export interface Init extends ClassReference.Init {
        aliasOf: ClassReference;
    }
}
export class AliasReference extends ClassReference {
    private aliasOf: ClassReference;
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
        const moduleBreadcrumbs = Module_.getModuleBreadcrumbs(declaredTypeName.fernFilepath, true);
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
        contents?: string[];
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
            this.innerType instanceof ClassReference ? this.innerType.fromJson("v") : undefined;
        return valueFromJsonFunction !== undefined
            ? new ConditionalStatement({
                  if_: {
                      rightSide: new FunctionInvocation({
                          // TODO: Do this field access on the client better
                          onObject: variable,
                          baseFunction: new Function_({ name: "nil?", functionBody: [] })
                      }),
                      operation: "!",
                      expressions: [
                          new FunctionInvocation({
                              baseFunction: new Function_({ name: "map", functionBody: [] }),
                              onObject: variable,
                              block: {
                                  arguments: "v",
                                  expressions: [
                                      new Expression({
                                          leftSide: "v",
                                          rightSide: new FunctionInvocation({
                                              onObject: "v",
                                              baseFunction: new Function_({ name: "to_json", functionBody: [] })
                                          }),
                                          isAssignment: true
                                      }),
                                      new Expression({ rightSide: valueFromJsonFunction, isAssignment: false })
                                  ]
                              }
                          })
                      ]
                  },
                  else_: [new Expression({ rightSide: "nil", isAssignment: false })]
              })
            : undefined;
    }
}

export class ArrayInstance extends AstNode {
    public contents: string[];
    constructor({ contents = [], ...rest }: ArrayReference.InitInstance) {
        super(rest);
        this.contents = contents;
    }

    public writeInternal(): void {
        this.addText({
            stringContent: this.contents.length > 0 ? this.contents.join(", ") : undefined,
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
            this.valueType instanceof ClassReference ? this.valueType.fromJson("v") : undefined;
        return valueFromJsonFunction !== undefined
            ? new ConditionalStatement({
                  if_: {
                      rightSide: new FunctionInvocation({
                          // TODO: Do this field access on the client better
                          onObject: variable,
                          baseFunction: new Function_({ name: "nil?", functionBody: [] })
                      }),
                      operation: "!",
                      expressions: [
                          new FunctionInvocation({
                              baseFunction: new Function_({ name: "transform_values", functionBody: [] }),
                              onObject: variable,
                              block: {
                                  arguments: "k, v",
                                  expressions: [
                                      new Expression({
                                          leftSide: "v",
                                          rightSide: new FunctionInvocation({
                                              onObject: "v",
                                              baseFunction: new Function_({ name: "to_json", functionBody: [] })
                                          }),
                                          isAssignment: true
                                      }),
                                      new Expression({ rightSide: valueFromJsonFunction, isAssignment: false })
                                  ]
                              }
                          })
                      ]
                  },
                  else_: [new Expression({ rightSide: "nil", isAssignment: false })]
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

    constructor({
        contents = new Map(),
        isFrozen = false,
        shouldCompact = false,
        additionalHashes = [],
        ...rest
    }: Hash_.InitInstance) {
        super(rest);

        this.contents = contents;
        this.isFrozen = isFrozen;
        this.shouldCompact = shouldCompact;
        this.additionalHashes = additionalHashes;
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
            }${hashContents.map(([k, v]) => k + ": " + (v instanceof AstNode ? v.write({}) : `'${v}'`)).join(", ")} }`
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
        name: string;
    }
}

export class EnumReference extends ClassReference {
    constructor({ name, ...rest }: ClassReference.Init) {
        super({ name, ...rest });
    }

    static fromDeclaredTypeName(
        declaredTypeName: DeclaredTypeName,
        locationGenerator: LocationGenerator
    ): EnumReference {
        const location = locationGenerator.getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = Module_.getModuleBreadcrumbs(declaredTypeName.fernFilepath, true);
        return new EnumReference({
            name: declaredTypeName.name.pascalCase.safeName,
            import_: new Import({ from: location }),
            moduleBreadcrumbs
        });
    }
}

export declare namespace Set_ {
    export interface InitReference extends AstNode.Init {
        innerType: ClassReference | string;
    }
    export interface InitInstance extends AstNode.Init {
        contents?: string[];
    }
}
export class SetReference extends ClassReference {
    constructor({ innerType, ...rest }: Set_.InitReference) {
        const typeName = innerType instanceof ClassReference ? innerType.qualifiedName : innerType;
        super({
            name: "Set",
            typeHint: `Set<${typeName}>`,
            import_: new Import({ from: "set", isExternal: true }),
            ...rest
        });
    }

    public fromJson(variable: Variable | string): AstNode | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "new", functionBody: [] }),
            onObject: new ClassReference({ name: "Set", import_: new Import({ from: "set", isExternal: true }) }),
            arguments_: [new Argument({ value: variable, isNamed: false, type: GenericClassReference })]
        });
    }
}

export class SetInstance extends AstNode {
    public contents: string[];
    constructor({ contents = [], ...rest }: Set_.InitInstance) {
        super(rest);
        this.contents = contents;
    }

    public writeInternal(): void {
        this.addText({
            stringContent: this.contents.length > 0 ? this.contents.join(", ") : undefined,
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
                        arguments_: [new Argument({ value: variable, isNamed: false, type: GenericClassReference })]
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
    public generatedReferences: Map<TypeId, ClassReference>;

    public resolvedReferences: Map<TypeId, ClassReference[]>;

    constructor(typeDeclarations: Map<TypeId, TypeDeclaration>, locationGenerator: LocationGenerator) {
        this.locationGenerator = locationGenerator;
        this.typeDeclarations = typeDeclarations;
        this.generatedReferences = new Map();
        this.resolvedReferences = new Map();
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
                    const resolvedTypeId = atd.resolvedType._visit<TypeId | undefined>({
                        named: (rnt: ResolvedNamedType) => rnt.name.typeId,
                        container: (ct) => this.forContainerType(ct).resolvedTypeId,
                        primitive: (pt) => this.forPrimitiveType(pt).resolvedTypeId,
                        unknown: () => undefined,
                        _other: () => undefined
                    });
                    return AliasReference.fromDeclaredTypeName(
                        type.name,
                        aliasOfCr,
                        resolvedTypeId,
                        this.locationGenerator
                    );
                },
                enum: () => EnumReference.fromDeclaredTypeName(type.name, this.locationGenerator),
                object: () => SerializableObjectReference.fromDeclaredTypeName(type.name, this.locationGenerator),
                union: () => DiscriminatedUnionClassReference.fromDeclaredTypeName(type.name, this.locationGenerator),
                undiscriminatedUnion: (uutd: UndiscriminatedUnionTypeDeclaration) => {
                    this.resolvedReferences.set(
                        typeId,
                        uutd.members.map((member) => this.fromTypeReference(member.type))
                    );
                    return SerializableObjectReference.fromDeclaredTypeName(type.name, this.locationGenerator);
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
        const cr = this.generatedReferences.get(declaredTypeName.typeId);
        // Likely you care attempting to generate an alias and the aliased class has not yet been created.
        // Create it now!
        if (cr === undefined) {
            const td = this.typeDeclarations.get(declaredTypeName.typeId);
            if (td !== undefined) {
                return this.fromTypeDeclaration(td);
            }
            throw new Error("ClassReference requested does not exist");
        }
        return cr;
    }

    public fromTypeReference(typeReference: TypeReference): ClassReference {
        return typeReference._visit<ClassReference>({
            container: (ct) => this.forContainerType(ct),
            named: (dtn) => this.fromDeclaredTypeName(dtn),
            primitive: (pt) => this.forPrimitiveType(pt),
            _other: (value: { type: string }) => new ClassReference({ name: value.type }),
            unknown: () => GenericClassReference
        });
    }

    public forPrimitiveType(primitive: PrimitiveType): ClassReference {
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

    public forContainerType(containerType: ContainerType): ClassReference {
        return containerType._visit<ClassReference>({
            list: (tr: TypeReference) => new ArrayReference({ innerType: this.fromTypeReference(tr) }),
            map: (mt: MapType) =>
                new HashReference({
                    keyType: this.fromTypeReference(mt.keyType),
                    valueType: this.fromTypeReference(mt.keyType)
                }),
            // Optional types in Ruby look the same except they're defaulted to nil in signatures.
            optional: (tr: TypeReference) => this.fromTypeReference(tr),
            set: (tr: TypeReference) => new SetReference({ innerType: this.fromTypeReference(tr) }),
            literal: (lit: Literal) =>
                Literal._visit<ClassReference>(lit, {
                    string: () => StringClassReference,
                    boolean: () => BooleanClassReference,
                    _other: (value: { type: string }) => new ClassReference({ name: value.type })
                }),
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
