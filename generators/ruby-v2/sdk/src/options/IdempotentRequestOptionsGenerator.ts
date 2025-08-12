import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { join, RelativeFilePath } from "@fern-api/path-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator } from "./BaseOptionsGenerator";

export const IDEMPOTENT_REQUEST_OPTIONS_CLASS_NAME = "IdempotentRequestOptions";

export class IdempotentRequestOptionsGenerator extends FileGenerator<
    RubyFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): RubyFile {
        const todoModule = this.context.getRootModule();
        todoModule.addStatement(ruby.class_({ name: "TODO" }));
        return new RubyFile({
            node: todoModule,
            directory: RelativeFilePath.of("TODO"),
            filename: `${IDEMPOTENT_REQUEST_OPTIONS_CLASS_NAME}.rb`,
            customConfig: this.context.customConfig
        });
    }

    public getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("TODO")
    }

    
    // public doGenerate(): RubyFile {
    //     const class_ = ruby.class_({
    //         ...this.context.getIdempotentRequestOptionsClassReference(),
    //         partial: true,
    //         access: ruby.Access.Public,
    //         interfaceReferences: [this.context.getIdempotentRequestOptionsInterfaceClassReference()],
    //         annotations: [this.context.getSerializableAttribute()]
    //     });
    //     class_.addFields(this.baseOptionsGenerator.getRequestOptionFields());
    //     class_.addFields(this.baseOptionsGenerator.getIdempotentRequestOptionFields());
    //     class_.addMethod(
    //         ruby.method({
    //             name: "GetIdempotencyHeaders",
    //             parameters: [],
    //             return_: ruby.Type.reference(this.context.getHeadersClassReference()),
    //             interfaceReference: this.context.getIdempotentRequestOptionsInterfaceClassReference(),
    //             type: ruby.MethodType.INSTANCE,
    //             body: ruby.codeblock((writer) => {
    //                 writer.writeLine("return new Headers(new Dictionary<string, string>");
    //                 writer.writeLine("{");
    //                 writer.indent();
    //                 for (const header of this.context.getIdempotencyHeaders()) {
    //                     const type = this.context.csharpTypeMapper.convert({ reference: header.valueType });
    //                     const isString =
    //                         type.internalType.type === "string" ||
    //                         (type.internalType.type === "optional" &&
    //                             type.internalType.value.internalType.type === "string");
    //                     const toString = isString ? "" : ".ToString()";
    //                     // In header values, we only accept simple types, so we can assume that none are nullable (apart from string),
    //                     // unless the type is optional
    //                     const nullConditionalOperator = !isString && type.isOptional() ? "?" : "";
    //                     writer.writeLine(
    //                         `["${header.name.wireValue}"] = ${header.name.name.pascalCase.safeName}${nullConditionalOperator}${toString},`
    //                     );
    //                 }
    //                 writer.dedent();
    //                 writer.writeTextStatement("})");
    //             })
    //         })
    //     );
    //     return new RubyFile({
    //         clazz: class_,
    //         directory: this.context.getPublicCoreDirectory(),
    //         allNamespaceSegments: this.context.getAllNamespaceSegments(),
    //         allTypeClassReferences: this.context.getAllTypeClassReferences(),
    //         namespace: this.context.getPublicCoreNamespace(),
    //         customConfig: this.context.customConfig
    //     });
    // }

    // protected getFilepath(): RelativeFilePath {
    //     return join(
    //         this.context.project.filepaths.getPublicCoreFilesDirectory(),
    //         RelativeFilePath.of(`${IDEMPOTENT_REQUEST_OPTIONS_CLASS_NAME}.cs`)
    //     );
    // }
}
