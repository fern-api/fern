/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, SwiftFile } from "@fern-api/swift-codegen";
import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorCli";
import Utils from "../Utils";
import { CodeBuilder } from "./CodeBuilder";

export default class EnumBuilder extends CodeBuilder<SwiftFile> {

  private readonly enumDeclaration: EnumTypeDeclaration;

  constructor(
    context: ModelGeneratorContext,
    typeDeclaration: TypeDeclaration,
    enumDeclaration: EnumTypeDeclaration
  ) {
    super(context, typeDeclaration);
    this.enumDeclaration = enumDeclaration;
  }

  public build(): SwiftFile {

    const name = this.typeDeclaration.name.name.pascalCase.safeName;
    
    const fields = this.enumDeclaration.values.map(enumValue => {

      const name = enumValue.name.name;

      // const type = enumValue.valueType._visit<Type>({
      //   container:                 (value) => Swift.makeType({ name: value.type }),
      //   named:                     (value) => Swift.makeType({ name: value.name.pascalCase.safeName }),
      //   primitive:             (valueType) => Swift.makePrimative({ key: valueType.v2?.type }),
      //   unknown:                        () => Swift.makeType({ name: "Unknown" }),
      //   _other: (value: { type: string; }) => Swift.makeType({ name: value.type }),
      // });
      
      // example: case name = "name"
      return Swift.makeEnumCase({
        name: name.camelCase.safeName,
        key: name.originalName,
      });

    });

    const output = Swift.makeFile({
      fileHeader: Swift.makeFileHeader({
        header: Utils.fileHeaderGenerator(name)
      }),
      node: Swift.makeEnum({
        accessLevel: AccessLevel.Public,
        name: name,
        enumCases: fields,
      })
    });

    return new SwiftFile({
      name: name,
      file: output,
      directory: this.context.config.output.path,
    });

  }

}