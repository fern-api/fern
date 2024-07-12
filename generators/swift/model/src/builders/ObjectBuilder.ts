/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, EnumCase, Field, SwiftFile, Type, VariableType } from "@fern-api/swift-codegen";
import { Literal, MapType, ObjectProperty, ObjectTypeDeclaration, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";
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

  private buildCodingArgs(properties: ObjectProperty[]): EnumCase.Args[] {
    return properties.map(property => {
      return {
        name: property.name.name.camelCase.safeName,
        key: `"${property.name.name.originalName}"`,
      };
    });
  }

  private buildFields(properties: ObjectProperty[]): Field[] {

    return properties.map(property => {

      const type = property.valueType._visit<Type>({
        container:                 (value) => {

          return value._visit<Type>({
            list: (value: TypeReference) => {
              throw new Error("Function not implemented.");
            },
            map: (value: MapType) => {
              throw new Error("Function not implemented.");
            },
            optional: (value: TypeReference) => {

              // THIA CAN BE property.valueType

              throw new Error("Function not implemented.");
            },
            set: (value: TypeReference) => {
              throw new Error("Function not implemented.");
            },
            literal: (value: Literal) => {
              throw new Error("Function not implemented.");
            },
            _other: (value: { type: string; }) => {
              throw new Error("Function not implemented.");
            }
          });

          // return value.type._visit<Type>({
          //   container: (value) => undefined,
          //   named: (value) => Swift.makeType({ name: value.name.pascalCase.safeName }),
          //   primitive: (value) => Swift.makeType({ name: value.name.pascalCase.safeName }),
          //   unknown: () => Swift.makeType({ name: value.name.pascalCase.safeName }),
          //   _other: (value: { type: string; }) => Swift.makeType({ name: value.name.pascalCase.safeName }),
          // });

          // Swift.makeType({ name: `1: "${value.type}"` })
        },
        named:                     (value) => Swift.makeType({ name: value.name.pascalCase.safeName }),
        primitive:             (valueType) => Swift.makePrimative({ key: valueType.v2?.type }),
        unknown:                        () => Swift.makeType({ name: "Unknown" }),
        _other: (value: { type: string; }) => Swift.makeType({ name: `2: "${value.type}"` }),
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

    // Destructure values
    const { name } = this.typeDeclaration;
    const { properties } = this.objectDeclaration;
    const safeName = name.name.pascalCase.safeName;

    // Build file
    const output = Swift.factories.structs.makeCodableStruct({
      safeName: safeName, 
      codingArgs: this.buildCodingArgs(properties),
      fields: this.buildFields(properties)
    });

    // Return the GeneratedFile
    return new SwiftFile({
      name: safeName,
      file: output,
      directory: this.context.config.output.path,
    });

  }

}