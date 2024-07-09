/* eslint-disable @typescript-eslint/no-extraneous-class */
import * as Ast from "./ast";
export * from "./ast";

export default class Swift {

  static indentSize = 4;

  public static makeFileHeader(args: Ast.FileHeader.Args): Ast.FileHeader {
    return new Ast.FileHeader(args);
  }
  
  public static makeImport(args: Ast.Import.Args): Ast.Import {
    return new Ast.Import(args);
  }
  
  public static makeParam(args: Ast.Param.Args): Ast.Param {
    return new Ast.Param(args);
  }

  public static makeEnumCase(args: Ast.EnumCase.Args): Ast.EnumCase {
    return new Ast.EnumCase(args);
  }

  public static makeEnum(args: Ast.Enum.Args): Ast.Enum {
    return new Ast.Enum(args);
  }
  
  public static makeFunc(args: Ast.Func.Args): Ast.Func {
    return new Ast.Func(args);
  }

  public static makeType(args: Ast.Type.Args): Ast.Type {
    return new Ast.Type(args);
  }
  
  public static makeFile(args: Ast.File.Args): Ast.File {
    return new Ast.File(args);
  }

}