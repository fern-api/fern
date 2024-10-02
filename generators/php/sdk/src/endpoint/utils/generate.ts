import { php } from "@fern-api/php-codegen";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function throwNewBaseException({
    context,
    message
}: {
    context: SdkGeneratorContext;
    message: php.CodeBlock;
}): php.CodeBlock {
    return php.codeblock((writer) => {
        writer.write("throw ");
        writer.writeNode(
            php.instantiateClass({
                classReference: context.getBaseExceptionClassReference(),
                arguments_: [
                    {
                        name: "message",
                        assignment: message
                    },
                    {
                        name: "previous",
                        assignment: php.codeblock("$e")
                    }
                ]
            })
        );
    });
}
