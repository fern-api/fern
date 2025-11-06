import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, is } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator } from "./BaseOptionsGenerator";

export class IdempotentRequestOptionsGenerator extends FileGenerator<
    CSharpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.types.IdempotentRequestOptions,
            partial: true,
            access: ast.Access.Public,
            interfaceReferences: [this.types.IdempotentRequestOptionsInterface],
            annotations: [this.extern.System.Serializable]
        });
        this.baseOptionsGenerator.getRequestOptionFields(class_);
        this.context.getIdempotencyFields(class_);
        class_.addMethod({
            name: "GetIdempotencyHeaders",
            parameters: [],
            return_: this.csharp.Type.reference(this.types.Headers),
            interfaceReference: this.types.IdempotentRequestOptionsInterface,
            type: ast.MethodType.INSTANCE,
            body: this.csharp.codeblock((writer) => {
                writer.write(
                    "return new ",
                    this.types.Headers,
                    "(new ",
                    this.extern.System.Collections.Generic.Dictionary(this.csharp.Type.string, this.csharp.Type.string),
                    "()"
                );
                writer.writeLine();
                writer.pushScope();
                for (const header of this.context.getIdempotencyHeaders()) {
                    const type = this.context.csharpTypeMapper.convert({ reference: header.valueType });
                    const isString = is.Type.string(type.unwrapIfOptional());
                    const toString = isString ? "" : ".ToString()";
                    // In header values, we only accept simple types, so we can assume that none are nullable (apart from string),
                    // unless the type is optional
                    const nullConditionalOperator = !isString && type.isOptional ? "?" : "";
                    writer.writeLine(
                        `["${header.name.wireValue}"] = ${header.name.name.pascalCase.safeName}${nullConditionalOperator}${toString},`
                    );
                }
                writer.popScope();
                writer.writeTextStatement(")");
            })
        });
        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.publicCore,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.publicCoreFiles,
            RelativeFilePath.of(`${this.types.IdempotentRequestOptions.name}.cs`)
        );
    }
}
