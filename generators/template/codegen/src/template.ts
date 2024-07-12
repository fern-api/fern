/* eslint-disable @typescript-eslint/no-extraneous-class */
import * as Ast from "./ast";
export * from "./ast";

export default class LANGUAGE {
    static indentSize = 4;

    // Breakdown the language functionality here.
    // Checkout CSharp or Swift for more inspiration
    // public static makeField(args: Ast.NAME.Args): Ast.NAME {
    //   return new Ast.NAME(args);
    // }

    public static makeFunction(args: Ast.Func.Args): Ast.Func {
        return new Ast.Func(args);
    }

    public static makeClass(args: Ast.Class.Args): Ast.Class {
        return new Ast.Class(args);
    }

    public static makeFile(args: Ast.File.Args): Ast.File {
        return new Ast.File(args);
    }
}
