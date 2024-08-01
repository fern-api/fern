/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { SwiftClass, SwiftFile } from "@fern-api/swift-codegen";
import { AliasTypeDeclaration, EnumTypeDeclaration, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorCli";
import { CodeBuilder } from "./CodeBuilder";
import Utils from "./Utils";

export default class TypeAliasBuilder extends CodeBuilder<SwiftFile | undefined> {

  constructor(
    context: ModelGeneratorContext,
    typeDeclaration: TypeDeclaration,
  ) {
    super(context, typeDeclaration);
  }

  public build(): SwiftFile | undefined {

    const { shape, docs, name } = this.typeDeclaration;
    const safeName = name.name.pascalCase.safeName;

    const type = shape._visit<SwiftClass | undefined>({
      alias: (value: AliasTypeDeclaration) => {
        return Utils.getClassForTypeReference(value.aliasOf);
      },
      enum: (etd: EnumTypeDeclaration) => undefined,
      object: (otd: ObjectTypeDeclaration) => undefined,
      undiscriminatedUnion: () => undefined,
      union: () => undefined,
      _other: () => undefined
    });

    if (!type) {
      return undefined;
    }

    const output = Swift.makeFile({
      fileHeader: Swift.makeHeaderWithFernStub(safeName),
      node: Swift.makeTypeAlias({
        name: safeName,
        class: type,
        comment: docs
      })
    });

    return new SwiftFile({
      name: safeName,
      file: output,
      directory: this.context.config.output.path,
    });

  }

}