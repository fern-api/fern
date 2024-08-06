/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, SwiftFile } from "@fern-api/swift-codegen";
import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorCli";
import { CodeGenerator } from "./CodeGenerator";

export default class EnumGenerator extends CodeGenerator<SwiftFile> {

  private readonly enumDeclaration: EnumTypeDeclaration;

  constructor(
    context: ModelGeneratorContext,
    typeDeclaration: TypeDeclaration,
    enumDeclaration: EnumTypeDeclaration
  ) {
    super(context, typeDeclaration);
    this.enumDeclaration = enumDeclaration;
  }

  public generate(): SwiftFile {

    // Get the file name
    const name = this.typeDeclaration.name.name.pascalCase.safeName;

    // Value for the type of enum used
    // TODO: Handle more enum types in the future
    const inheritanceClass = Swift.makeString();
    
    // Break up the fields and values
    const fields = this.enumDeclaration.values.map(enumValue => {

      const name = enumValue.name;
      
      // example: case name = "name"
      return Swift.makeEnumCase({
        name: name.name.camelCase.safeName,
        value: `"${name.wireValue}"`,
        comment: enumValue.docs,
      });

    });

    const output = Swift.makeFile({
      fileHeader: Swift.makeHeaderWithFernStub(name),
      node: Swift.makeEnum({
        accessLevel: AccessLevel.Public,
        name: name,
        inheritance: [inheritanceClass],
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