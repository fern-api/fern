import { php } from "@fern-api/php-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export const WITH_RAW_RESPONSE_METHOD_NAME = "withRawResponse";

const WITH_RAW_RESPONSE_DOCS = "Access the status and the headers of a response, not only its deserialized body.";

/**
 * The fields an endpoint method reads: the client options, the shared `RawClient` and, where they
 * exist, the environment and the routing auth provider. A subpackage client and a raw client
 * declare the same ones, so the endpoint bodies both emit are interchangeable.
 */
export function addEndpointClientFields({
    class_,
    context
}: {
    class_: php.Class;
    context: SdkGeneratorContext;
}): void {
    class_.addField(
        php.field({
            name: `$${context.getClientOptionsName()}`,
            access: "private",
            type: context.getClientOptionsType(),
            docs: "@phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator"
        })
    );
    class_.addField(context.rawClient.getField());

    if (isMultiUrl(context)) {
        class_.addField(
            php.field({
                name: "$environment",
                access: "private",
                type: php.Type.reference(context.getEnvironmentsClassReference())
            })
        );
    }

    // Under ENDPOINT_SECURITY, the shared RoutingAuthProvider is threaded down from the
    // root client so a client's endpoints can route their own auth headers.
    if (context.isEndpointSecurity()) {
        class_.addField(
            php.field({
                name: "$routingAuthProvider",
                access: "private",
                // Nullable so the token providers' internal auth client (whose token
                // endpoint is unauthenticated) can be constructed without one.
                type: php.Type.optional(php.Type.reference(context.getRoutingAuthProviderClassReference())),
                // Read in endpoint methods (via HttpEndpointGenerator) and passed to nested
                // subclients; unused only in subclients with no authenticated endpoints.
                docs: "@phpstan-ignore-next-line Property is read in endpoint methods and passed to subclients"
            })
        );
    }
}

/**
 * The raw client's constructor parameters, in order. The plain client passes its field of the
 * same name for each, and the raw client assigns it to that field, defaulting to `fallback`.
 */
function getRawClientConstructorParameters(
    context: SdkGeneratorContext
): { parameter: php.Parameter; fallback?: string }[] {
    const parameters: { parameter: php.Parameter; fallback?: string }[] = [
        {
            parameter: php.parameter({
                name: context.rawClient.getFieldName(),
                type: php.Type.reference(context.rawClient.getClassReference())
            })
        }
    ];
    if (isMultiUrl(context)) {
        parameters.push({
            parameter: php.parameter({
                name: "environment",
                type: php.Type.reference(context.getEnvironmentsClassReference())
            })
        });
    }
    // Always taken, multi-url included: a raw call has to be made with the same options
    // (base url override, headers, timeout, retries) as its plain counterpart.
    parameters.push({
        parameter: php.parameter({
            name: context.getClientOptionsName(),
            type: php.Type.optional(context.getClientOptionsType()),
            initializer: php.codeblock("null")
        }),
        fallback: "[]"
    });
    if (context.isEndpointSecurity()) {
        parameters.push({
            parameter: php.parameter({
                name: "routingAuthProvider",
                type: php.Type.optional(php.Type.reference(context.getRoutingAuthProviderClassReference())),
                initializer: php.codeblock("null")
            })
        });
    }
    return parameters;
}

export function getRawClientConstructor(context: SdkGeneratorContext): php.Class.Constructor {
    const parameters = getRawClientConstructorParameters(context);
    return {
        parameters: parameters.map(({ parameter }) => parameter),
        body: php.codeblock((writer) => {
            for (const { parameter, fallback } of parameters) {
                const assignment = `${getFieldAccess(parameter)} = ${parameter.name}`;
                writer.writeTextStatement(fallback != null ? `${assignment} ?? ${fallback}` : assignment);
            }
        })
    };
}

/** The `withRawResponse()` signature an interface declares, without a body. */
export function getWithRawResponseSignature(rawClassReference: php.ClassReference): php.Method {
    return php.method({
        name: WITH_RAW_RESPONSE_METHOD_NAME,
        access: "public",
        parameters: [],
        return_: php.Type.reference(rawClassReference),
        docs: WITH_RAW_RESPONSE_DOCS,
        noBody: true
    });
}

/**
 * `withRawResponse()`: the same endpoints as the client it is called on, each returning the
 * response metadata alongside the deserialized body. The raw client is a few references to what
 * this client already holds, so it is built on each call rather than kept in a field.
 */
export function getWithRawResponseMethod({
    context,
    rawClassReference
}: {
    context: SdkGeneratorContext;
    rawClassReference: php.ClassReference;
}): php.Method {
    return php.method({
        name: WITH_RAW_RESPONSE_METHOD_NAME,
        access: "public",
        parameters: [],
        return_: php.Type.reference(rawClassReference),
        docs: WITH_RAW_RESPONSE_DOCS,
        body: php.codeblock((writer) => {
            writer.write("return ");
            writer.writeNodeStatement(
                php.instantiateClass({
                    classReference: rawClassReference,
                    arguments_: getRawClientConstructorParameters(context).map(({ parameter }) =>
                        php.codeblock(getFieldAccess(parameter))
                    )
                })
            );
        })
    });
}

/** `$this->name` for a parameter `$name`, whose name carries the `$` already. */
function getFieldAccess(parameter: php.Parameter): string {
    return `$this->${parameter.name.slice(1)}`;
}

function isMultiUrl(context: SdkGeneratorContext): boolean {
    return context.ir.environments?.environments.type === "multipleBaseUrls";
}
