import { assertNever } from "@fern-api/core-utils";
import {
    ExampleEndpointCall,
    ExamplePathParameter,
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    Literal,
    PathParameter,
    TypeDeclaration,
    TypeId
} from "@fern-api/ir-sdk";

import { getOriginalName } from "../utils/namesUtils.js";
import { getUrlForExample } from "./v1/generateEndpointExample.js";
import { generatePathParameterExamples } from "./v1/generateParameterExamples.js";

type IrWithoutSdkConfig = Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;

interface PathParameterBucket {
    declared: PathParameter[];
    examples: ExamplePathParameter[];
}

/**
 * Fills in path parameters a user-specified example does not supply, using the same values example
 * autogeneration would have produced. Generators render a call per example, so an example missing a
 * declared path parameter produces a snippet that omits a required argument.
 *
 * Mutates the IR in place.
 */
export function backfillMissingPathParameterExamples({ ir }: { ir: IrWithoutSdkConfig }): IrWithoutSdkConfig {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            for (const userSpecifiedExample of endpoint.userSpecifiedExamples) {
                if (userSpecifiedExample.example == null) {
                    continue;
                }
                backfillExample({
                    typeDeclarations: ir.types,
                    rootPathParameters: ir.pathParameters,
                    service,
                    endpoint,
                    example: userSpecifiedExample.example
                });
            }
        }
    }
    return ir;
}

function backfillExample({
    typeDeclarations,
    rootPathParameters,
    service,
    endpoint,
    example
}: {
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    rootPathParameters: PathParameter[];
    service: HttpService;
    endpoint: HttpEndpoint;
    example: ExampleEndpointCall;
}): void {
    const buckets: PathParameterBucket[] = [
        { declared: rootPathParameters, examples: example.rootPathParameters },
        { declared: service.pathParameters, examples: example.servicePathParameters },
        { declared: endpoint.pathParameters, examples: example.endpointPathParameters }
    ];
    const suppliedNames = new Set(
        buckets.flatMap((bucket) => bucket.examples.map((pathParameter) => getOriginalName(pathParameter.name)))
    );

    let anyMissing = false;
    // A parameter with a client default is deliberately left out of the example: the client supplies
    // it, so only the URL needs its value.
    const clientDefaultValues: Record<string, string> = {};
    for (const bucket of buckets) {
        for (const pathParameter of bucket.declared) {
            if (suppliedNames.has(getOriginalName(pathParameter.name))) {
                continue;
            }
            anyMissing = true;
            if (pathParameter.clientDefault != null) {
                clientDefaultValues[getOriginalName(pathParameter.name)] = literalToString(pathParameter.clientDefault);
                continue;
            }
            const pathParameterExample = generateExample({ pathParameter, typeDeclarations });
            if (pathParameterExample == null) {
                continue;
            }
            bucket.examples.push(pathParameterExample);
        }
    }

    if (anyMissing) {
        // The URL was built from the incomplete example, so it interpolates "undefined" for every
        // parameter the example did not supply.
        example.url = getUrlForExample(endpoint, example, clientDefaultValues);
    }
}

function generateExample({
    pathParameter,
    typeDeclarations
}: {
    pathParameter: PathParameter;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
}): ExamplePathParameter | undefined {
    // One parameter per call: generatePathParameterExamples short-circuits on the first failure,
    // which would otherwise discard the values generated for the other parameters.
    const generated = generatePathParameterExamples([pathParameter], {
        typeDeclarations,
        skipOptionalRequestProperties: true,
        maxDepth: 1
    });
    if (generated.type === "failure") {
        return undefined;
    }
    return generated.example[0];
}

function literalToString(literal: Literal): string {
    switch (literal.type) {
        case "string":
            return literal.string;
        case "boolean":
            return String(literal.boolean);
        default:
            assertNever(literal);
    }
}
