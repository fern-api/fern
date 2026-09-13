import { php } from "@fern-api/php-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * One constructor parameter of a raw client, together with what the plain client passes for it
 * and how the raw client stores it.
 *
 * The raw client's constructor and the `withRawResponse()` call that builds it are generated
 * from this one ordered list, so the two cannot drift out of position.
 */
interface RawClientConstructorParameter {
    parameter: php.Parameter;
    /** The expression the plain client hands over, read off its own fields. */
    argument: php.AstNode;
    /** The statement the raw client's constructor uses to keep it. */
    assignment: string;
}

function getRawClientConstructorParameters({
    context,
    isMultiUrl
}: {
    context: SdkGeneratorContext;
    isMultiUrl: boolean;
}): RawClientConstructorParameter[] {
    const clientFieldName = context.rawClient.getFieldName();
    const optionsName = context.getClientOptionsName();

    const parameters: RawClientConstructorParameter[] = [
        {
            parameter: php.parameter({
                name: clientFieldName,
                type: php.Type.reference(context.rawClient.getClassReference())
            }),
            argument: php.codeblock(`$this->${clientFieldName}`),
            assignment: `$this->${clientFieldName} = $${clientFieldName}`
        }
    ];

    if (isMultiUrl) {
        parameters.push({
            parameter: php.parameter({
                name: "environment",
                type: php.Type.reference(context.getEnvironmentsClassReference())
            }),
            argument: php.codeblock("$this->environment"),
            assignment: "$this->environment = $environment"
        });
    }

    // Always taken, multi-url included: the root client holds real options (base url override,
    // headers, timeout, retries) whatever the environment shape is, and a raw call has to be made
    // with the same ones as its plain counterpart.
    parameters.push({
        parameter: php.parameter({
            name: optionsName,
            type: php.Type.optional(context.getClientOptionsType()),
            initializer: php.codeblock("null")
        }),
        argument: php.codeblock(`$this->${optionsName}`),
        assignment: `$this->${optionsName} = $${optionsName} ?? []`
    });

    if (context.isEndpointSecurity()) {
        parameters.push({
            parameter: php.parameter({
                name: "routingAuthProvider",
                type: php.Type.optional(php.Type.reference(context.getRoutingAuthProviderClassReference())),
                initializer: php.codeblock("null")
            }),
            argument: php.codeblock("$this->routingAuthProvider"),
            assignment: "$this->routingAuthProvider = $routingAuthProvider"
        });
    }

    return parameters;
}

/**
 * The constructor a raw client shares with the plain client it belongs to: the same parameters,
 * assigned to the same fields, so the endpoint bodies both classes emit are interchangeable.
 */
export function getRawClientConstructor({
    context,
    isMultiUrl
}: {
    context: SdkGeneratorContext;
    isMultiUrl: boolean;
}): php.Class.Constructor {
    const parameters = getRawClientConstructorParameters({ context, isMultiUrl });
    return {
        parameters: parameters.map(({ parameter }) => parameter),
        body: php.codeblock((writer) => {
            for (const { assignment } of parameters) {
                writer.writeTextStatement(assignment);
            }
        })
    };
}

/** What the plain client passes to that constructor, in the order it declares. */
export function getRawClientConstructorArguments({
    context,
    isMultiUrl
}: {
    context: SdkGeneratorContext;
    isMultiUrl: boolean;
}): php.AstNode[] {
    return getRawClientConstructorParameters({ context, isMultiUrl }).map(({ argument }) => argument);
}
