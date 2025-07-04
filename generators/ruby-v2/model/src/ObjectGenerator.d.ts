import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { RelativeFilePath } from "../../../../packages/commons/fs-utils/src";
import { BaseRubyCustomConfigSchema } from "../../ast/src";
import { FileGenerator, RubyFile } from "../../base/src";
import { SdkGeneratorContext } from "../../sdk/src/SdkGeneratorContext";
export declare class ObjectGenerator extends FileGenerator<RubyFile, BaseRubyCustomConfigSchema, SdkGeneratorContext> {
    protected readonly context: SdkGeneratorContext;
    private readonly td;
    private readonly otd;
    constructor(context: SdkGeneratorContext, td: TypeDeclaration, otd: ObjectTypeDeclaration);
    doGenerate(): RubyFile;
    private toField;
    protected getFilepath(): RelativeFilePath;
}
