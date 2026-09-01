import { php } from "@fern-api/php-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { getRawClientConstructorArguments } from "./rawClientConstructor.js";

/** The memoizing field behind `withRawResponse()`. */
export const RAW_CLIENT_FIELD_NAME = "rawResponseClient";

const WITH_RAW_RESPONSE_DOCS = "Access the status and the headers of a response, not only its deserialized body.";

/** The `withRawResponse()` signature an interface declares, without a body. */
export function getWithRawResponseSignature({
    context,
    rawClassReference
}: {
    context: SdkGeneratorContext;
    rawClassReference: php.ClassReference;
}): php.Method {
    return php.method({
        name: context.getWithRawResponseMethodName(),
        access: "public",
        parameters: [],
        return_: php.Type.reference(rawClassReference),
        docs: WITH_RAW_RESPONSE_DOCS,
        noBody: true
    });
}

/**
 * `withRawResponse()`: the same endpoints as the client it is called on, each returning the
 * response metadata alongside the deserialized body.
 *
 * The raw client is built from the fields this client already holds, so it talks to the same
 * http client with the same options and, where they exist, the same environment and routing
 * auth provider. It is built once and kept, so repeated calls hand back the same client.
 */
export function getWithRawResponseMethod({
    context,
    rawClassReference,
    isMultiUrl
}: {
    context: SdkGeneratorContext;
    rawClassReference: php.ClassReference;
    isMultiUrl: boolean;
}): php.Method {
    const arguments_ = getRawClientConstructorArguments({ context, isMultiUrl });

    return php.method({
        name: context.getWithRawResponseMethodName(),
        access: "public",
        parameters: [],
        return_: php.Type.reference(rawClassReference),
        docs: WITH_RAW_RESPONSE_DOCS,
        body: php.codeblock((writer) => {
            writer.write(`return $this->${RAW_CLIENT_FIELD_NAME} ??= `);
            writer.writeNodeStatement(
                php.instantiateClass({
                    classReference: rawClassReference,
                    arguments_
                })
            );
        })
    });
}
