/* eslint-disable @typescript-eslint/no-extraneous-class */
// Swift Imports
import { AccessLevel } from "./ast/AccessLevel";
import { Comment } from "./ast/Comment";
import { Enum } from "./ast/Enum";
import { EnumCase } from "./ast/EnumCase";
import { EnumCaseAssociatedValue } from "./ast/EnumCaseAssociatedValue";
import { Field } from "./ast/Field";
import { File } from "./ast/File";
import { FileHeader } from "./ast/FileHeader";
import { Func } from "./ast/Func";
import { Import } from "./ast/Import";
import { Optional } from "./ast/Optional";
import { Param } from "./ast/Param";
import { Primative } from "./ast/Primative";
import { Struct } from "./ast/Struct";
import { SwiftArray } from "./ast/SwiftArray";
import { SwiftClass } from "./ast/SwiftClass";
import { SwiftDictionary } from "./ast/SwiftDictionary";
import { TypeAlias } from "./ast/TypeAlias";

// Swift Exports
export { AccessLevel } from "./ast/AccessLevel";
export { Comment } from "./ast/Comment";
export { Enum } from "./ast/Enum";
export { EnumCase } from "./ast/EnumCase";
export { EnumCaseAssociatedValue } from "./ast/EnumCaseAssociatedValue";
export { Field } from "./ast/Field";
export { File } from "./ast/File";
export { FileHeader } from "./ast/FileHeader";
export { Func } from "./ast/Func";
export { FunctionModifier } from "./ast/FunctionModifier";
export { Import } from "./ast/Import";
export { Optional } from "./ast/Optional";
export { Param } from "./ast/Param";
export { Primative } from "./ast/Primative";
export type { PrimativeKey } from "./ast/Primative";
export { Struct } from "./ast/Struct";
export { SwiftArray } from "./ast/SwiftArray";
export { SwiftClass } from "./ast/SwiftClass";
export { SwiftDictionary as SwiftMap } from "./ast/SwiftDictionary";
export { VariableType } from "./ast/VariableType";
export { SwiftFile } from "./project/SwiftFile";

export default class Swift {

  /**
   * 🔧 Config
   */

  static indentSize = 4;

  /**
   * 🧱 Core Nodes
   */

  public static makeFileHeader(args: FileHeader.Args): FileHeader {
    return new FileHeader(args);
  }

  public static makeComment(args: Comment.Args): Comment {
    return new Comment(args);
  }

  public static makeTypeAlias(args: TypeAlias.Args): TypeAlias {
    return new TypeAlias(args);
  }
  
  public static makeImport(args: Import.Args): Import {
    return new Import(args);
  }

  public static makeField(args: Field.Args): Field {
    return new Field(args);
  }
  
  public static makeParam(args: Param.Args): Param {
    return new Param(args);
  }

  public static makeEnumCase(args: EnumCase.Args): EnumCase {
    return new EnumCase(args);
  }

  public static makeEnumCaseAssociatedValue(args: EnumCaseAssociatedValue.Args): EnumCaseAssociatedValue {
    return new EnumCaseAssociatedValue(args);
  }

  public static makeEnum(args: Enum.Args): Enum {
    return new Enum(args);
  }
  
  public static makeFunc(args: Func.Args): Func {
    return new Func(args);
  }

  public static makePrimative(args: Primative.Args): Primative {
    return new Primative(args);
  }

  public static makeStruct(args: Struct.Args): Struct {
    return new Struct(args);
  }

  public static makeClass(args: SwiftClass.Args): SwiftClass {
    return new SwiftClass(args);
  }

  public static makeArray(args: SwiftArray.Args): SwiftArray {
    return new SwiftArray(args);
  }

  public static makeDictionary(args: SwiftDictionary.Args): SwiftDictionary {
    return new SwiftDictionary(args);
  }

  public static makeOptional(args: Optional.Args): Optional {
    return new Optional(args);
  }
  
  public static makeFile(args: File.Args): File {
    return new File(args);
  }

  public static makeBool(): Primative {
    return Swift.makePrimative({ 
      key: "boolean" 
    });
  }

  public static makeString(): Primative {
    return Swift.makePrimative({ 
      key: "string" 
    });
  }

  public static makeInt(): Primative {
    return Swift.makePrimative({ 
      key: "integer" 
    });
  }

  public static makeFoundation(): Import {
    return Swift.makeImport({
      packageName: "Foundation",
    });
  }

  public static makeCodable(): SwiftClass {
    return Swift.makeClass({
      name: "Codable"
    });
  }

  public static makeAny(): Primative {
    return Swift.makeClass({ 
      name: "Any" 
    });
  }

  /** Used for JSON Deserialization
   * 
   * @returns
   * enum CodingKeys: String, CodingKey {
   *   case pageNumber = "page_number"
   *   case pageSize = "page_size"
   *   case configsPage = "configs_page"
   * }
   * 
   */
  public static makeCodingKeys(args: EnumCase.Args[]): Enum {
    return Swift.makeEnum({
      name: "CodingKeys",
      inheritance: [
        Swift.makeString(),
        Swift.makeClass({ name: "CodingKey" })
      ],
      enumCases: args.map(value => {
        return Swift.makeEnumCase(value);
      })
    });
  }

 /**
  * @returns 
  * import Foundation
  * 
  * public struct ReturnPagedConfigs: Codable {
  * 
  *   enum CodingKeys: String, CodingKey {
  *     case pageNumber = "page_number"
  *   }
  * 
  *   let pageNumber: Int?
  * 
  * }
  */
  public static makeCodableStruct(props: {  safeName: string, codingArgs: EnumCase.Args[], fields: Field[], comment?: string }): File {
   return Swift.makeFile({
      fileHeader: Swift.makeHeaderWithFernStub(props.safeName),
      imports: [
        Swift.makeFoundation()
      ],
      node: Swift.makeStruct({
        comment: props.comment,
        accessLevel: AccessLevel.Public,
        name: props.safeName,
        inheritance: [
          Swift.makeCodable()
        ],
        subclasses: [
          Swift.makeCodingKeys(props.codingArgs),
        ],
        fields: props.fields,
        addInitializer: true,
      })
    });
  }

  public static makeHeaderWithFernStub(filename: string): FileHeader {
    return Swift.makeFileHeader({
      header: `
//
//  ${filename}.swift
//
//
//  This file was auto-generated by Fern
//
    `.trim()
    });
  }

}