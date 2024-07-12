/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, Field, SwiftFile, Type, VariableType } from "@fern-api/swift-codegen";
import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorCli";
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

  private buildFields(properties: ObjectProperty[]): Field[] {

    return properties.map(property => {

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

  }

  public build(): SwiftFile {

    // Destrucutre values
    const { name } = this.typeDeclaration;
    const { properties } = this.objectDeclaration;

    // Get name
    const safeName = name.name.pascalCase.safeName;

    // TODO: Coding key support
    

    // Build file
    const output = Swift.factories.structs.makeCodableStruct(
      safeName, 
      this.buildFields(properties)
    );

    // Return the GeneratedFile
    return new SwiftFile({
      name: safeName,
      file: output,
      directory: this.context.config.output.path,
    });

  }

}