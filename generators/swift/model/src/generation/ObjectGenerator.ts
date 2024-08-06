/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, EnumCase, Field, SwiftFile, VariableType } from "@fern-api/swift-codegen";
import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorCli";
import { CodeGenerator } from "./CodeGenerator";
import Utils from "./Utils";

export default class ObjectGenerator extends CodeGenerator<SwiftFile> {

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
        value: `"${property.name.wireValue}"`,
      };
    });
  }

  private buildFields(properties: ObjectProperty[]): Field[] {

    const fields = properties.map(property => {

      // Build the object type
      const type = Utils.getClassForTypeReference(property.valueType);

      // Skip if undefined
      if (!type) {
        return undefined;
      }
      
      // example: let name: String
      return Swift.makeField({
        comment: property.docs,
        accessLevel: AccessLevel.Public,
        variableType: VariableType.Let,
        name: property.name.name.camelCase.safeName,
        class: type
      });

    });

    return fields.filter((field): field is Field => field !== undefined);

  }

  public generate(): SwiftFile {

    // TODO - Swift: Add support for v53 unions

    // const flattenedProperties = [
    //   ...this.objectDeclaration.properties,
    //   ...(this.objectDeclaration.extendedProperties ?? [])
    // ];

    // Destructure values
    const { name, docs } = this.typeDeclaration;
    const { properties } = this.objectDeclaration;
    const safeName = name.name.pascalCase.safeName;

    // Build file
    const output = Swift.makeCodableStruct({
      comment: docs,
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