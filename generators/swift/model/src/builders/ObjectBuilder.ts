/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { AccessLevel, Class_, EnumCase, Field, SwiftFile, VariableType } from "@fern-api/swift-codegen";
import { ContainerType, DeclaredTypeName, Literal, MapType, ObjectProperty, ObjectTypeDeclaration, PrimitiveType, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";
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

  private getClassForTypeReference(typeReference: TypeReference): Class_ {
    return typeReference._visit<Class_>({
      container: (value: ContainerType) => {
        return this.getClassForContainer(value);
      },
      named: (value: DeclaredTypeName) => {
        return Swift.makeClass({ name: value.name.originalName });
      },
      primitive: (value: PrimitiveType) => {
        return Swift.makePrimative({ key: value.v2?.type });
      },
      unknown: () => {
        return Swift.factories.types.makeAny();
      },
      _other: (value: { type: string; }) => {
        return Swift.factories.types.makeAny();
      }
    });
  }

  private getClassForContainer(value: ContainerType): Class_ {
    return value._visit<Class_>({
      list: (value: TypeReference) => {
        return this.getClassForTypeReference(value).toArray();
      },
      map: (value: MapType) => {
        return Swift.makeClass({ name: `${value.valueType.type} :: map TODO` });
      },
      optional: (value: TypeReference) => {
        return this.getClassForTypeReference(value).toOptional();
      },
      set: (value: TypeReference) => {
        return Swift.makeClass({ name: `${value.type} :: set TODO` });
      },
      literal: (value: Literal) => {
        return Swift.makeClass({ name: `${value.type} :: literal TODO` });
      },
      _other: (value: { type: string; }) => {
        return Swift.makeClass({ name: `${value.type} :: _other TODO` });
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

      // Build the object type
      const type = this.getClassForTypeReference(property.valueType);

      // Skip if undefined
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