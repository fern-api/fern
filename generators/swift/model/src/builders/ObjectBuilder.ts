/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, SwiftFile, Type, VariableType } from "@fern-api/swift-codegen";
import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorCli";
import Utils from "../Utils";
import { CodeBuilder } from "./CodeBuilder";

export default class ObjectBuilder extends CodeBuilder<SwiftFile> {

  private readonly objectDeclaration: ObjectTypeDeclaration;

  constructor(
    context: ModelGeneratorContext,
    typeDeclaration: TypeDeclaration,
    objectDeclaration: ObjectTypeDeclaration
  ) {
    super(context, typeDeclaration);
    this.objectDeclaration = objectDeclaration;
  }

  public build(): SwiftFile {

    const name = this.typeDeclaration.name.name.pascalCase.safeName;
    
    const fields = this.objectDeclaration.properties.map(property => {

      const type = property.valueType._visit<Type>({
        container:                 (value) => Swift.makeType({ name: value.type }),
        named:                     (value) => Swift.makeType({ name: value.name.pascalCase.safeName }),
        primitive:             (valueType) => Swift.makePrimative({ key: valueType.v2?.type }),
        unknown:                        () => Swift.makeType({ name: "Unknown" }),
        _other: (value: { type: string; }) => Swift.makeType({ name: value.type }),
      });
      
      // example: let name: String
      return Swift.makeField({
        accessLevel: AccessLevel.Public,
        variableType: VariableType.Let,
        name: property.name.name.camelCase.safeName,
        valueType: type
      });

    });

    const output = Swift.makeFile({
      fileHeader: Swift.makeFileHeader({
        header: Utils.fileHeaderGenerator(name)
      }),
      node: Swift.makeStruct({
        accessLevel: AccessLevel.Public,
        name: name,
        fields: fields,
      })
    });

    return new SwiftFile({
      name: name,
      file: output,
      directory: this.context.config.output.path,
    });

  }

}