/* eslint-disable @typescript-eslint/no-extraneous-class */
import { Enum } from "./ast/Enum";
import { EnumCase } from "./ast/EnumCase";
import { File } from "./ast/File";
import { FileHeader } from "./ast/FileHeader";
import { Func } from "./ast/Func";
import { Import } from "./ast/Import";
import { Param } from "./ast/Param";
import { Type } from "./ast/Type";

export { AccessLevel } from "./ast/AccessLevel";
export { ClassLevel } from "./ast/ClassLevel";
export { Enum } from "./ast/Enum";
export { EnumCase } from "./ast/EnumCase";
export { File } from "./ast/File";
export { FileHeader } from "./ast/FileHeader";
export { Func } from "./ast/Func";
export { FunctionModifier } from "./ast/FunctionModifier";
export { Import } from "./ast/Import";
export { Param } from "./ast/Param";
export { Type } from "./ast/Type";
export { SwiftFile } from "./project/SwiftFile";

export default class Swift {

  static indentSize = 4;

  public static makeFileHeader(args: FileHeader.Args): FileHeader {
    return new FileHeader(args);
  }
  
  public static makeImport(args: Import.Args): Import {
    return new Import(args);
  }
  
  public static makeParam(args: Param.Args): Param {
    return new Param(args);
  }

  public static makeEnumCase(args: EnumCase.Args): EnumCase {
    return new EnumCase(args);
  }

  public static makeEnum(args: Enum.Args): Enum {
    return new Enum(args);
  }
  
  public static makeFunc(args: Func.Args): Func {
    return new Func(args);
  }

  public static makeType(args: Type.Args): Type {
    return new Type(args);
  }
  
  public static makeFile(args: File.Args): File {
    return new File(args);
  }

}
