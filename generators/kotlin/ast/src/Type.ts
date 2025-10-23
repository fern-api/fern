import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";

export interface TypeArgs {
    name: string;
    nullable?: boolean;
    typeParameters?: Type[];
}

export class Type implements AstNode {
    public readonly name: string;
    public readonly nullable: boolean;
    public readonly typeParameters: Type[];

    constructor({ name, nullable = false, typeParameters = [] }: TypeArgs) {
        this.name = name;
        this.nullable = nullable;
        this.typeParameters = typeParameters;
    }

    public write(writer: Writer): void {
        writer.write(this.name);
        if (this.typeParameters.length > 0) {
            writer.write("<");
            this.typeParameters.forEach((param, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                param.write(writer);
            });
            writer.write(">");
        }
        if (this.nullable) {
            writer.write("?");
        }
    }

    public static string(nullable = false): Type {
        return new Type({ name: "String", nullable });
    }

    public static int(nullable = false): Type {
        return new Type({ name: "Int", nullable });
    }

    public static long(nullable = false): Type {
        return new Type({ name: "Long", nullable });
    }

    public static double(nullable = false): Type {
        return new Type({ name: "Double", nullable });
    }

    public static boolean(nullable = false): Type {
        return new Type({ name: "Boolean", nullable });
    }

    public static any(nullable = false): Type {
        return new Type({ name: "Any", nullable });
    }

    public static unit(): Type {
        return new Type({ name: "Unit" });
    }

    public static list(elementType: Type, nullable = false): Type {
        return new Type({ name: "List", nullable, typeParameters: [elementType] });
    }

    public static set(elementType: Type, nullable = false): Type {
        return new Type({ name: "Set", nullable, typeParameters: [elementType] });
    }

    public static map(keyType: Type, valueType: Type, nullable = false): Type {
        return new Type({ name: "Map", nullable, typeParameters: [keyType, valueType] });
    }
}
