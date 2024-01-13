import { ContainerType, DeclaredTypeName, Literal, MapType, PrimitiveType, TypeReference } from "@fern-fern/ir-sdk/api";
import { TYPES_DIRECTORY } from "../../utils/Constants";
import { AstNode } from "../AstNode";
import { Import } from "../Import";
import { ArrayReference } from "../primitives/Array_";
import { HashReference } from "../primitives/Hash_";
import { SetReference } from "../primitives/Set_";

enum RubyClass {
    INTEGER = "Integer",
    DOUBLE = "Float",
    STRING = "String",
    BOOLEAN = "Boolean",
    LONG = "Long",
    DATETIME = "DateTime",
    DATE = "Date",
    UUID = "UUID",
    BASE64 = "String",
    OBJECT = "Object",
    JSON = "JSON"
}

export declare namespace ClassReference {
    export interface Init extends AstNode.Init {
        name: string;
        import_?: Import;
        location?: string;
    }
}

export class ClassReference extends AstNode {
    public name: string;
    public import_: Import | undefined;
    public location: string | undefined;

    constructor({ name, import_, location, ...rest }: ClassReference.Init) {
        super(rest);
        this.location = location;
        this.name = name;
        this.import_ = import_;
    }

    public writeInternal(startingTabSpaces: number): string {
        return this.writePaddedString(startingTabSpaces, this.name);
    }

    static fromDeclaredTypeName(declaredTypeName: DeclaredTypeName): ClassReference {
        // TODO: there's probably a cleaner way of doing this, but here we're ensuring type files
        // are written to a "types" subdirectory
        const location = [...declaredTypeName.fernFilepath.packagePath.map((pathPart) => pathPart.snakeCase.safeName), TYPES_DIRECTORY, declaredTypeName.fernFilepath.file].join("/");
        return new ClassReference({
            name: declaredTypeName.name.pascalCase.safeName,
            import_: new Import({ from: location }),
            location
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
}

export const GenericClassReference = new ClassReference({ name: RubyClass.OBJECT });
export const JsonClassReference = new ClassReference({ name: RubyClass.JSON });
export const NilValue = "nil";
