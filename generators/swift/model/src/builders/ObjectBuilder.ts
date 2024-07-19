/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, Class_, EnumCase, Field, SwiftFile, VariableType } from "@fern-api/swift-codegen";
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

  private buildContainer(value: ContainerType): Class_ {
    return value._visit<Class_>({
      list: (value) => {
        const type = value._visit<Class_>({
          container:                 (value) => Swift.factories.types.makeAny(),
          named:                     (value) => Swift.makeClass({ name: value.name.pascalCase.safeName }),
          primitive:             (valueType) => Swift.makePrimative({ key: valueType.v2?.type }),
          unknown:                        () => Swift.factories.types.makeAny(),
          _other: (value: { type: string; }) => Swift.factories.types.makeAny(),
        });
        return type; // TODO: Support lists
      },
      map: (value) => {
        return Swift.makeClass({
          name: "map: " + value.valueType.type
        });
      },
      optional: (value) => {
        const type = value._visit<Class_>({
          container:                 (value) => Swift.factories.types.makeAny(),
          named:                     (value) => Swift.makeClass({ name: value.name.pascalCase.safeName }),
          primitive:             (valueType) => Swift.makePrimative({ key: valueType.v2?.type }),
          unknown:                        () => Swift.factories.types.makeAny(),
          _other: (value: { type: string; }) => Swift.factories.types.makeAny(),
        });
        return type.toOptional();
      },
      set: (value) => {
        return Swift.makeClass({
          name: "set: " + value.type
        });
      },
      literal: (value) => {
        return Swift.makeClass({
          name: "literal: " + value.type
        });
      },
      _other: (value: { type: string; }) => {
        return Swift.makeClass({
          name: "_other: " + value.type
        });
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

      const type = property.valueType._visit<Class_ | undefined>({
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