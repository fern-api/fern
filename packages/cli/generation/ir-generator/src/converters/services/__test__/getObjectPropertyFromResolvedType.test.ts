import { PrimitiveTypeV1, TypeReference } from "@fern-api/ir-sdk";
import { CliError } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { FernFileContext } from "../../../FernFileContext.js";
import { ResolvedType } from "../../../resolvers/ResolvedType.js";
import { TypeResolver } from "../../../resolvers/TypeResolver.js";
import { getObjectPropertyFromResolvedType } from "../getObjectPropertyFromResolvedType.js";

describe("getObjectPropertyFromResolvedType", () => {
    it("classifies response properties on non-object responses as reference errors", () => {
        const resolvedType: ResolvedType = {
            _type: "primitive",
            primitive: {
                v1: PrimitiveTypeV1.String,
                v2: undefined
            },
            originalTypeReference: TypeReference.primitive({
                v1: PrimitiveTypeV1.String,
                v2: undefined
            })
        };

        try {
            getObjectPropertyFromResolvedType({
                typeResolver: createUnusedTypeResolver(),
                file: { relativeFilepath: "definition.yml" } as FernFileContext,
                resolvedType,
                property: "results"
            });
            throw new Error("Expected getObjectPropertyFromResolvedType to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(CliError);
            if (error instanceof CliError) {
                expect(error.code).toBe(CliError.Code.ReferenceError);
            }
        }
    });
});

function createUnusedTypeResolver(): TypeResolver {
    return {
        resolveType: vi.fn(),
        resolveTypeOrThrow: vi.fn(),
        getDeclarationOfNamedType: vi.fn(),
        getDeclarationOfNamedTypeOrThrow: vi.fn(),
        resolveNamedType: vi.fn(),
        resolveNamedTypeOrThrow: vi.fn()
    };
}
