import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "..";

export abstract class CodeGenerator<T> {

  protected readonly context: ModelGeneratorContext;
  protected readonly typeDeclaration: TypeDeclaration;

  constructor(
    context: ModelGeneratorContext,
    typeDeclaration: TypeDeclaration
  ) {
    this.context = context;
    this.typeDeclaration = typeDeclaration;
  }

  public abstract generate(): T;

}