import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";

import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

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
        class_.addField(
            php.field({
                name: "headers",
                type: php.Type.map(php.Type.string(), php.Type.array(php.Type.string())),
                access: "private"
            })
        );

        class_.addConstructor(this.getConstructorMethod());
        class_.addMethod(this.getBodyGetterMethod());
        class_.addMethod(this.getHeadersGetterMethod());
        class_.addMethod(this.getHeaderLineGetterMethod());
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
            }),
            // Last, and defaulted, so an existing caller constructing this exception positionally
            // keeps working.
            php.parameter({
                name: "headers",
                type: php.Type.map(php.Type.string(), php.Type.array(php.Type.string())),
                initializer: php.codeblock("[]")
            })
        ];
        return {
            access: "public",
            parameters,
            body: php.codeblock((writer) => {
                writer.writeTextStatement("$this->body = $body");
                writer.writeTextStatement("$this->headers = $headers");
                writer.writeTextStatement("parent::__construct($message, $statusCode, $previous)");
            })
        };
    }

    private getHeadersGetterMethod(): php.Method {
        return php.method({
            name: "getHeaders",
            access: "public",
            parameters: [],
            return_: php.Type.map(php.Type.string(), php.Type.array(php.Type.string())),
            docs: "Returns the headers of the response that triggered the exception.",
            body: php.codeblock((writer) => {
                writer.writeTextStatement("return $this->headers");
            })
        });
    }

    private getHeaderLineGetterMethod(): php.Method {
        return php.method({
            name: "getHeaderLine",
            access: "public",
            parameters: [
                php.parameter({
                    name: "name",
                    type: php.Type.string()
                })
            ],
            return_: php.Type.optional(php.Type.string()),
            docs: 'Returns one response header, matched case insensitively as http requires, with its values joined by ", "; null when the response did not carry it.',
            body: php.codeblock((writer) => {
                writer.controlFlow("foreach", php.codeblock("$this->headers as $header => $values"));
                writer.controlFlow("if", php.codeblock("strcasecmp($header, $name) === 0"));
                writer.writeTextStatement("return implode(', ', $values)");
                writer.endControlFlow();
                writer.endControlFlow();
                writer.writeTextStatement("return null");
            })
        });
    }

    private getToStringMethod(): php.Method {
        return php.method({
            name: "__toString",
            access: "public",
            parameters: [],
            return_: php.Type.string(),
            body: php.codeblock((writer) => {
                writer.controlFlow("if", php.codeblock("empty($this->body)"));
                writer.writeTextStatement("return $this->message . '; Status Code: ' . $this->getCode() . \"\\n\"");
                writer.endControlFlow();
                writer.writeTextStatement(
                    "return $this->message . '; Status Code: ' . $this->getCode() . '; Body: ' . print_r($this->body, true) . \"\\n\""
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
