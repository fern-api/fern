/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { Class, PrimativeKey, SwiftFile } from "@fern-api/swift-codegen";
import { EnumTypeDeclaration, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorCli";
import { CodeBuilder } from "./CodeBuilder";

export default class TypeAliasBuilder extends CodeBuilder<SwiftFile | undefined> {

  constructor(
    context: ModelGeneratorContext,
    typeDeclaration: TypeDeclaration,
  ) {
    super(context, typeDeclaration);
  }

  public build(): SwiftFile | undefined {

    const name = this.typeDeclaration.name.name.pascalCase.safeName;

    const type = this.typeDeclaration.shape._visit<Class | undefined>({
      alias: (value) => {

        // TODO: Doc strings

        const typeName = value.aliasOf._visit<PrimativeKey | undefined>({
          container: (value) => undefined,
          named: (value) => undefined,
          primitive: (value) => value.v2?.type,
          unknown: () => undefined,
          _other: (value: { type: string; }) => undefined
        });

        if (typeName) {
          return Swift.makePrimative({
            key: typeName
          });
        }

        return undefined;

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
      fileHeader: Swift.factories.fileHeaders.makeHeaderWithFernStub(name),
      node: Swift.makeTypeAlias({
        name: name,
        class: type
      })
    });

    return new SwiftFile({
      name: name,
      file: output,
      directory: this.context.config.output.path,
    });

  }

}