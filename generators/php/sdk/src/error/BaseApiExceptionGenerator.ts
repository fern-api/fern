import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile, php } from "@fern-api/php-codegen";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseApiExceptionGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): PhpFile {
        const class_ = php.class_({
            ...this.context.getBaseApiExceptionClassReference(),
            parentClassReference: this.context.getBaseExceptionClassReference(),
            docs: "This exception type will be thrown for any non-2XX API responses."
        });

        class_.addField(
            php.field({
                name: "body",
                type: php.Type.mixed(),
                access: "private"
            })
        );

        class_.addConstructor(this.getConstructorMethod());
        class_.addMethod(this.getBodyGetterMethod());
        class_.addMethod(this.getToStringMethod());

        return new PhpFile({
            clazz: class_,
            directory: this.context.getLocationForBaseException().directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getConstructorMethod(): php.Class.Constructor {
        const parameters: php.Parameter[] = [
            php.parameter({
                name: "message",
                type: php.Type.string()
            }),
            php.parameter({
                name: "statusCode",
                type: php.Type.int()
            }),
            php.parameter({
                name: "body",
                type: php.Type.mixed()
            }),
            php.parameter({
                name: "previous",
                type: php.Type.optional(php.Type.reference(this.context.getThrowableClassReference())),
                initializer: php.codeblock("null")
            })
        ];
        return {
            access: "public",
            parameters,
            body: php.codeblock((writer) => {
                writer.writeTextStatement("$this->body = $body");
                writer.writeTextStatement("parent::__construct($message, $statusCode, $previous)");
            })
        };
    }

    private getToStringMethod(): php.Method {
        return php.method({
            name: "__toString",
            access: "public",
            parameters: [],
            return_: php.Type.string(),
            body: php.codeblock((writer) => {
                writer.controlFlow("if", php.codeblock("empty($this->body)"));
                writer.writeTextStatement('return "$this->message; Status Code: $this->code\\n"');
                writer.endControlFlow();
                writer.writeTextStatement(
                    'return "$this->message; Status Code: $this->code; Body: " . $this->body . "\\n"'
                );
            })
        });
    }

    private getBodyGetterMethod(): php.Method {
        return php.method({
            name: "getBody",
            access: "public",
            parameters: [],
            return_: php.Type.mixed(),
            docs: "Returns the body of the response that triggered the exception.",
            body: php.codeblock((writer) => {
                writer.writeTextStatement("return $this->body");
            })
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(`${this.context.getBaseApiExceptionClassReference().name}.php`));
    }
}
