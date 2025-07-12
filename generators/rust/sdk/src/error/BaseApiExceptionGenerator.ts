import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseApiExceptionGenerator extends FileGenerator<RustFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): RustFile {
        const class_ = rust.struct({
            ...this.context.getBaseApiExceptionClassReference(),
            parentClassReference: this.context.getBaseExceptionClassReference(),
            docs: "This exception type will be thrown for any non-2XX API responses."
        });

        class_.addField(
            rust.field({
                name: "body",
                type: rust.Type.mixed(),
                access: "private"
            })
        );

        class_.addConstructor(this.getConstructorMethod());
        class_.addMethod(this.getBodyGetterMethod());
        class_.addMethod(this.getToStringMethod());

        return new RustFile({
            clazz: class_,
            directory: this.context.getLocationForBaseException().directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getConstructorMethod(): rust.Class.Constructor {
        const parameters: rust.Parameter[] = [
            rust.parameter({
                name: "message",
                type: rust.Type.string()
            }),
            rust.parameter({
                name: "statusCode",
                type: rust.Type.int()
            }),
            rust.parameter({
                name: "body",
                type: rust.Type.mixed()
            }),
            rust.parameter({
                name: "previous",
                type: rust.Type.optional(rust.Type.reference(this.context.getThrowableClassReference())),
                initializer: rust.codeblock("null")
            })
        ];
        return {
            access: "public",
            parameters,
            body: rust.codeblock((writer) => {
                writer.writeTextStatement("$this->body = $body");
                writer.writeTextStatement("parent::__construct($message, $statusCode, $previous)");
            })
        };
    }

    private getToStringMethod(): rust.Method {
        return rust.method({
            name: "__toString",
            access: "public",
            parameters: [],
            return_: rust.Type.string(),
            body: rust.codeblock((writer) => {
                writer.controlFlow("if", rust.codeblock("empty($this->body)"));
                writer.writeTextStatement('return "$this->message; Status Code: $this->code\\n"');
                writer.endControlFlow();
                writer.writeTextStatement(
                    'return "$this->message; Status Code: $this->code; Body: " . $this->body . "\\n"'
                );
            })
        });
    }

    private getBodyGetterMethod(): rust.Method {
        return rust.method({
            name: "getBody",
            access: "public",
            parameters: [],
            return_: rust.Type.mixed(),
            docs: "Returns the body of the response that triggered the exception.",
            body: rust.codeblock((writer) => {
                writer.writeTextStatement("return $this->body");
            })
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(`${this.context.getBaseApiExceptionClassReference().name}.php`));
    }
}
