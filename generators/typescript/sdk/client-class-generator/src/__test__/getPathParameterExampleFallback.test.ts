import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { describe, expect, it } from "vitest";

import { getPathParameterExampleFallback } from "../endpoints/utils/getPathParameterExampleFallback.js";

function createPathParameter(clientDefault: FernIr.Literal | undefined): FernIr.PathParameter {
    return {
        name: {
            originalName: "tenantId",
            camelCase: { unsafeName: "tenantId", safeName: "tenantId" },
            snakeCase: { unsafeName: "tenant_id", safeName: "tenant_id" },
            screamingSnakeCase: { unsafeName: "TENANT_ID", safeName: "TENANT_ID" },
            pascalCase: { unsafeName: "TenantId", safeName: "TenantId" }
        },
        valueType: FernIr.TypeReference.primitive({
            v1: FernIr.PrimitiveTypeV1.String,
            v2: undefined
        }),
        location: FernIr.PathParameterLocation.Endpoint,
        variable: undefined,
        docs: undefined,
        v2Examples: undefined,
        clientDefault,
        explode: undefined
    };
}

describe("getPathParameterExampleFallback", () => {
    it("renders the client default for a string parameter", () => {
        const expression = getPathParameterExampleFallback(createPathParameter(FernIr.Literal.string("acme")));
        expect(getTextOfTsNode(expression)).toBe('"acme"');
    });

    it("renders the client default for a boolean parameter", () => {
        const expression = getPathParameterExampleFallback(createPathParameter(FernIr.Literal.boolean(true)));
        expect(getTextOfTsNode(expression)).toBe("true");
    });

    it("renders undefined when there is no client default", () => {
        const expression = getPathParameterExampleFallback(createPathParameter(undefined));
        expect(getTextOfTsNode(expression)).toBe("undefined");
    });
});
