import { FernIr } from "@fern-fern/ir-sdk";

import type { SdkGeneratorContext } from "../../../SdkGeneratorContext.js";
import { ReferencedEndpointRequest } from "../ReferencedEndpointRequest.js";

const OBJECT_TYPE_ID = "type_:RefundRequest";
const ALIAS_TO_OPTIONAL = "type_:MaybeRefundRequest";
const ALIAS_TO_NULLABLE_OPTIONAL = "type_:NullableMaybeRefundRequest";
const ALIAS_TO_STRING = "type_:RefundId";

function named(typeId: string): FernIr.TypeReference {
    return FernIr.TypeReference.named({
        typeId,
        name: {
            originalName: typeId,
            camelCase: { unsafeName: typeId, safeName: typeId },
            snakeCase: { unsafeName: typeId, safeName: typeId },
            screamingSnakeCase: { unsafeName: typeId, safeName: typeId },
            pascalCase: { unsafeName: typeId, safeName: typeId }
        },
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        default: undefined,
        inline: undefined,
        displayName: undefined
    });
}

const optional = (inner: FernIr.TypeReference): FernIr.TypeReference =>
    FernIr.TypeReference.container(FernIr.ContainerType.optional(inner));
const nullable = (inner: FernIr.TypeReference): FernIr.TypeReference =>
    FernIr.TypeReference.container(FernIr.ContainerType.nullable(inner));
const string_ = (): FernIr.TypeReference => FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });

const resolvedOptional = FernIr.ResolvedTypeReference.container(FernIr.ContainerType.optional(named(OBJECT_TYPE_ID)));
const resolvedNullableOptional = FernIr.ResolvedTypeReference.container(
    FernIr.ContainerType.nullable(optional(named(OBJECT_TYPE_ID)))
);
const resolvedString = FernIr.ResolvedTypeReference.primitive({ v1: "STRING", v2: undefined });

const SHAPES: Record<string, FernIr.Type> = {
    [OBJECT_TYPE_ID]: FernIr.Type.object({
        extends: [],
        properties: [],
        extraProperties: false,
        extendedProperties: undefined,
        deferredUnionBaseProperties: undefined
    }),
    [ALIAS_TO_OPTIONAL]: FernIr.Type.alias({
        aliasOf: optional(named(OBJECT_TYPE_ID)),
        resolvedType: resolvedOptional
    }),
    [ALIAS_TO_NULLABLE_OPTIONAL]: FernIr.Type.alias({
        aliasOf: nullable(optional(named(OBJECT_TYPE_ID))),
        resolvedType: resolvedNullableOptional
    }),
    [ALIAS_TO_STRING]: FernIr.Type.alias({
        aliasOf: string_(),
        resolvedType: resolvedString
    })
};

// isOptional() only reaches context.model.dereferenceType; nothing else on the context is touched.
const context = {
    generation: undefined,
    model: {
        dereferenceType: (typeId: string) => {
            const shape = SHAPES[typeId];
            if (shape == null) {
                throw new Error(`test setup is missing a shape for ${typeId}`);
            }
            return { typeDeclaration: { shape } };
        }
    }
} as unknown as SdkGeneratorContext;

function isOptional(requestBodyShape: FernIr.TypeReference): boolean {
    const request = new ReferencedEndpointRequest(
        context,
        {} as unknown as FernIr.SdkRequest,
        {} as unknown as FernIr.HttpEndpoint,
        requestBodyShape,
        "service_" as FernIr.ServiceId
    );
    return request.isOptional();
}

describe("ReferencedEndpointRequest.isOptional", () => {
    describe("optional bodies get a default so callers may omit the argument", () => {
        it("optional<T>", () => {
            expect(isOptional(optional(named(OBJECT_TYPE_ID)))).toBe(true);
        });

        it("nullable<optional<T>>", () => {
            expect(isOptional(nullable(optional(named(OBJECT_TYPE_ID))))).toBe(true);
        });

        it("alias resolving to optional<T>", () => {
            expect(isOptional(named(ALIAS_TO_OPTIONAL))).toBe(true);
        });

        it("alias resolving to nullable<optional<T>>", () => {
            expect(isOptional(named(ALIAS_TO_NULLABLE_OPTIONAL))).toBe(true);
        });
    });

    describe("required bodies stay required", () => {
        it("a plain named object", () => {
            expect(isOptional(named(OBJECT_TYPE_ID))).toBe(false);
        });

        it("nullable<T> is not omittable — the body is required, it may just be null", () => {
            expect(isOptional(nullable(named(OBJECT_TYPE_ID)))).toBe(false);
        });

        it("an alias to a non-optional type", () => {
            expect(isOptional(named(ALIAS_TO_STRING))).toBe(false);
        });

        it("a primitive", () => {
            expect(isOptional(string_())).toBe(false);
        });
    });
});
