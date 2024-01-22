import { ContainerType, DeclaredTypeName, Literal, MapType, PrimitiveType, TypeReference } from "@fern-fern/ir-sdk/api";
import { getLocationForTypeDeclaration } from "../AbstractionUtilities";
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
    OPENSTRUCT = "OpenStruct"
}

export declare namespace ClassReference {
    export interface Init extends AstNode.Init {
        name: string;
        typeHint?: string;
        import_?: Import;
        location?: string;
        moduleBreadcrumbs?: string[];
    }
}

export class ClassReference extends AstNode {
    public name: string;
    public typeHint: string;
    public qualifiedName: string;
    public import_: Import | undefined;
    public location: string | undefined;

    constructor({ name, typeHint, import_, location, moduleBreadcrumbs, ...rest }: ClassReference.Init) {
        super(rest);
        this.location = location;
        this.name = name;
        this.import_ = import_;

        this.qualifiedName = [...(moduleBreadcrumbs ?? []), name].join("::");
        this.typeHint = typeHint ?? this.qualifiedName;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.name, startingTabSpaces });
    }

    public toJson(_variable: Variable | string): FunctionInvocation | undefined {
        return;
    }

    public fromJson(_variable: Variable | string): FunctionInvocation | undefined {
        return;
    }

    static fromDeclaredTypeName(declaredTypeName: DeclaredTypeName): ClassReference {
        // TODO: there's probably a cleaner way of doing this, but here we're ensuring type files
        // are written to a "types" subdirectory
        const crName = declaredTypeName.name.pascalCase.safeName;
        const location = getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = Module_.getModulePathFromTypeName(declaredTypeName);
        return new SerializableObjectReference({
            name: crName,
            import_: new Import({ from: `${location}/${crName}` }),
            location,
            moduleBreadcrumbs
        });
    }

    static fromTypeReference(typeReference: TypeReference): ClassReference {
        return typeReference._visit<ClassReference>({
            container: (ct) => ClassReference.forContainerType(ct),
            named: (dtn) => ClassReference.fromDeclaredTypeName(dtn),
            primitive: (pt) => ClassReference.forPrimitiveType(pt),
            _other: (value: { type: string }) => new ClassReference({ name: value.type }),
            unknown: () => GenericClassReference
        });
    }

    static forPrimitiveType(primitive: PrimitiveType): ClassReference {
        return PrimitiveType._visit<ClassReference>(primitive, {
            integer: () => new ClassReference({ name: RubyClass.INTEGER }),
            double: () => new ClassReference({ name: RubyClass.DOUBLE }),
            string: () => new ClassReference({ name: RubyClass.STRING }),
            boolean: () => new ClassReference({ name: RubyClass.BOOLEAN }),
            long: () => new ClassReference({ name: RubyClass.LONG }),
            dateTime: () => new ClassReference({ name: RubyClass.DATETIME }),
            date: () => new ClassReference({ name: RubyClass.DATE }),
            uuid: () => new ClassReference({ name: RubyClass.UUID }),
            base64: () => new ClassReference({ name: RubyClass.BASE64 }),
            _other: () => {
                throw new Error("Unexpected primitive type: " + primitive);
            }
        });
    }

    static forContainerType(containerType: ContainerType): ClassReference {
        return containerType._visit<ClassReference>({
            list: (tr: TypeReference) => new ArrayReference({ innerType: ClassReference.fromTypeReference(tr) }),
            map: (mt: MapType) =>
                new HashReference({
                    keyType: ClassReference.fromTypeReference(mt.keyType),
                    valueType: ClassReference.fromTypeReference(mt.keyType)
                }),
            // Optional types in Ruby look the same except they're defaulted to nil in signatures.
            optional: (tr: TypeReference) => ClassReference.fromTypeReference(tr),
            set: (tr: TypeReference) => new SetReference({ innerType: ClassReference.fromTypeReference(tr) }),
            literal: (lit: Literal) =>
                Literal._visit<ClassReference>(lit, {
                    string: () => new ClassReference({ name: RubyClass.STRING }),
                    boolean: () => new ClassReference({ name: RubyClass.BOOLEAN }),
                    _other: (value: { type: string }) => new ClassReference({ name: value.type })
                }),
            _other: () => {
                throw new Error("Unexpected primitive type: " + containerType.type);
            }
        });
    }

    public getImports(): Set<Import> {
        return new Set(this.import_ ? [this.import_] : []);
    }
}

export const OpenStructClassReference = new ClassReference({ name: RubyClass.OPENSTRUCT });
export const GenericClassReference = new ClassReference({ name: RubyClass.OBJECT });
export const JsonClassReference = new ClassReference({ name: RubyClass.JSON });
export const NilValue = "nil";

export declare namespace SerializableObjectReference {
    export type InitReference = ClassReference.Init;
}
export class SerializableObjectReference extends ClassReference {
    constructor(init: SerializableObjectReference.InitReference) {
        super({ ...init });
    }

    public fromJson(variable: string | Variable): FunctionInvocation | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "from_json", functionBody: [] }),
            onObject: this.qualifiedName,
            arguments_: [
                new Argument({ type: GenericClassReference, value: variable, isNamed: true, name: "json_object" })
            ]
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
    private innerType: ClassReference | string;
    constructor({ innerType, ...rest }: ArrayReference.InitReference) {
        const typeName = innerType instanceof ClassReference ? innerType.qualifiedName : innerType;
        super({
            name: `Array<${typeName}>`,
            import_: innerType instanceof ClassReference ? innerType.import_ : undefined,
            ...rest
        });

        this.innerType = innerType;
    }

    public fromJson(variable: string | Variable): FunctionInvocation | undefined {
        const valueFromJsonFunction =
            this.innerType instanceof ClassReference ? this.innerType.fromJson("v") : undefined;
        return valueFromJsonFunction !== undefined
            ? new FunctionInvocation({
                  baseFunction: new Function_({ name: "map", functionBody: [] }),
                  onObject: variable,
                  block: { arguments: "v", expressions: [new Expression({ rightSide: valueFromJsonFunction })] }
              })
            : undefined;
    }

    public toJson(variable: string | Variable): FunctionInvocation | undefined {
        const valueToJsonFunction = this.innerType instanceof ClassReference ? this.innerType.toJson("v") : undefined;
        return valueToJsonFunction !== undefined
            ? new FunctionInvocation({
                  baseFunction: new Function_({ name: "map", functionBody: [] }),
                  onObject: variable,
                  block: { arguments: "v", expressions: [new Expression({ rightSide: valueToJsonFunction })] }
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
    export interface InitReference extends AstNode.Init {
        name?: string;
        keyType: ClassReference | string;
        valueType: ClassReference | string;
    }
    export interface InitInstance extends AstNode.Init {
        contents?: Map<string, string | FunctionInvocation | Variable>;
        isFrozen?: boolean;
    }
}
export class HashReference extends ClassReference {
    valueType: ClassReference | string;
    constructor({ name, keyType, valueType, ...rest }: Hash_.InitReference) {
        const keyTypeName = keyType instanceof ClassReference ? keyType.qualifiedName : keyType;
        const valueTypeName = valueType instanceof ClassReference ? valueType.qualifiedName : valueType;
        const typeHint = `Hash{${keyTypeName} => ${valueTypeName}}`;
        const nameDefaulted = name ?? typeHint;
        super({ name: nameDefaulted, typeHint, ...rest });

        this.valueType = valueType;
    }
    public fromJson(variable: string | Variable): FunctionInvocation | undefined {
        const valueFromJsonFunction =
            this.valueType instanceof ClassReference ? this.valueType.fromJson("v") : undefined;
        return valueFromJsonFunction !== undefined
            ? new FunctionInvocation({
                  baseFunction: new Function_({ name: "transform_values", functionBody: [] }),
                  onObject: variable,
                  block: { arguments: "v", expressions: [new Expression({ rightSide: valueFromJsonFunction })] }
              })
            : undefined;
    }

    public toJson(variable: string | Variable): FunctionInvocation | undefined {
        const valueToJsonFunction = this.valueType instanceof ClassReference ? this.valueType.fromJson("v") : undefined;
        return valueToJsonFunction !== undefined
            ? new FunctionInvocation({
                  baseFunction: new Function_({ name: "transform_values", functionBody: [] }),
                  onObject: variable,
                  block: { arguments: "v", expressions: [new Expression({ rightSide: valueToJsonFunction })] }
              })
            : undefined;
    }
}

export class HashInstance extends AstNode {
    public contents: Map<string, string | FunctionInvocation | Variable>;
    public isFrozen: boolean;

    constructor({ contents = new Map(), isFrozen = false, ...rest }: Hash_.InitInstance) {
        super(rest);

        this.contents = contents;
        this.isFrozen = isFrozen;
    }

    public writeInternal(): void {
        const stringifiedMap = new Map(
            Array.from(this.contents.entries()).map(([k, v]) => [k, v instanceof AstNode ? v.write() : `'${v}'`])
        );

        this.addText({
            stringContent: JSON.stringify(Object.fromEntries(stringifiedMap), null, 1).replaceAll('"', "")
        });
        this.addText({ stringContent: this.isFrozen ? ".frozen" : undefined, appendToLastString: true });
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
        super({ name: `Set<${typeName}>`, import_: new Import({ from: "set", isExternal: true }), ...rest });
    }

    public toJson(variable: Variable | string): FunctionInvocation | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "to_a", functionBody: [] }),
            onObject: variable
        });
    }

    public fromJson(variable: Variable | string): FunctionInvocation | undefined {
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
