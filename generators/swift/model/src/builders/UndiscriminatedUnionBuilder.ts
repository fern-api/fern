/* eslint-disable @typescript-eslint/no-useless-constructor */
import Swift, { AccessLevel, SwiftFile } from "@fern-api/swift-codegen";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "..";
import { CodeBuilder } from "./CodeBuilder";

export default class UndiscriminatedUnionBuilder extends CodeBuilder<SwiftFile | undefined> {

  constructor(
    context: ModelGeneratorContext,
    typeDeclaration: TypeDeclaration,
  ) {
    super(context, typeDeclaration);
  }

  public build(): SwiftFile {

    const { docs, name, referencedTypes } = this.typeDeclaration;
    const safeName = name.name.pascalCase.safeName;

    const type = Swift.makeEnum({
      accessLevel: AccessLevel.Public,
      comment: docs,
      name: safeName,
      enumCases: Array.from(referencedTypes).map(type => {
        const title = type.replace("type_:", ""); // TODO - Swift: This is not safe. Looking into following CSharp more closely
        return Swift.makeEnumCaseAssociatedValue({
          name: title,
          value: Swift.makeClass({
            name: title
          })
        });
      })
    });

    const output = Swift.makeFile({
      fileHeader: Swift.makeHeaderWithFernStub(safeName),
      node: type,
    });

    return new SwiftFile({
      name: safeName,
      file: output,
      directory: this.context.config.output.path,
    });

  }

}