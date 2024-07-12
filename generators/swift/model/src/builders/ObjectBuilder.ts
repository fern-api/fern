/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, Class, EnumCase, Field, SwiftFile, VariableType } from "@fern-api/swift-codegen";
import { ContainerType, ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
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

  private buildContainer(value: ContainerType): Class {
    return value._visit<Class>({
      list: (value) => {
        throw new Error("Function not implemented.");
      },
      map: (value) => {
        throw new Error("Function not implemented.");
      },
      optional: (value) => {
        const type = value._visit<Class>({
          container:                 (value) => Swift.factories.types.makeAny(),
          named:                     (value) => Swift.makeClass({ name: value.name.pascalCase.safeName }),
          primitive:             (valueType) => Swift.makePrimative({ key: valueType.v2?.type }),
          unknown:                        () => Swift.factories.types.makeAny(),
          _other: (value: { type: string; }) => Swift.factories.types.makeAny(),
        });
        return type.toOptional();
      },
      set: (value) => {
        throw new Error("Function not implemented.");
      },
      literal: (value) => {
        throw new Error("Function not implemented.");
      },
      _other: (value: { type: string; }) => {
        throw new Error("Function not implemented.");
      }
    });
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

    const fields = properties.map(property => {

      const type = property.valueType._visit<Class | undefined>({
        container:                 (value) => this.buildContainer(value),
        named:                     (value) => Swift.makeClass({ name: value.name.pascalCase.safeName }),
        primitive:             (valueType) => Swift.makePrimative({ key: valueType.v2?.type }),
        unknown:                        () => undefined,
        _other: (value: { type: string; }) => undefined,
      });

      // Drop if undefined
      if (!type) {
        return undefined;
      }
      
      // example: let name: String
      return Swift.makeField({
        accessLevel: AccessLevel.Public,
        variableType: VariableType.Let,
        name: property.name.name.camelCase.safeName,
        class: type
      });

    });

    return fields.filter((field): field is Field => field !== undefined);

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