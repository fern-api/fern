import { BaseRubyCustomConfigSchema, ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { responseBodyLoader } from "../responseBody.js";

const writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };

const USER_TYPE_ID = "type_users:User";

function namedType(): FernIr.TypeReference {
    return FernIr.TypeReference.named({
        typeId: USER_TYPE_ID,
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        name: {
            originalName: "User",
            camelCase: { unsafeName: "user", safeName: "user" },
            snakeCase: { unsafeName: "user", safeName: "user" },
            screamingSnakeCase: { unsafeName: "USER", safeName: "USER" },
            pascalCase: { unsafeName: "User", safeName: "User" }
        },
        default: undefined,
        inline: undefined,
        displayName: undefined
    });
}

function stringType(): FernIr.TypeReference {
    return FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
}

function render(typeReference: FernIr.TypeReference): string {
    return responseBodyLoader({
        typeReference,
        responseVariableName: "response",
        rootModuleName: "Seed",
        getReferenceToTypeId: (typeId) =>
            ruby.classReference({
                name: typeId === USER_TYPE_ID ? "User" : typeId,
                modules: ["Seed", "Users", "Types"]
            }),
        getRubyType: (reference) => {
            switch (reference.type) {
                case "container":
                    switch (reference.container.type) {
                        case "list":
                            return ruby.Type.array(ruby.Type.class_({ name: "Seed::Users::Types::User" }));
                        case "map":
                            return ruby.Type.hash(ruby.Type.string(), ruby.Type.integer());
                        case "set":
                        case "optional":
                        case "nullable":
                        case "literal":
                            throw new Error(`unexpected container ${reference.container.type}`);
                    }
                    break;
                case "named":
                case "primitive":
                case "unknown":
                    throw new Error(`unexpected type ${reference.type}`);
            }
        }
    }).toString(writerConfig);
}

describe("responseBodyLoader", () => {
    it("loads named types through .load", () => {
        expect(render(namedType())).toBe("Seed::Users::Types::User.load(response.body)");
    });

    it("parses and coerces top-level list responses", () => {
        expect(render(FernIr.TypeReference.container(FernIr.ContainerType.list(namedType())))).toBe(
            "Seed::Internal::Types::Utils.coerce(Internal::Types::Array[Seed::Users::Types::User], JSON.parse(response.body, symbolize_names: true))"
        );
    });

    it("parses and coerces top-level map responses", () => {
        expect(
            render(
                FernIr.TypeReference.container(
                    FernIr.ContainerType.map({
                        keyType: stringType(),
                        valueType: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined })
                    })
                )
            )
        ).toBe(
            "Seed::Internal::Types::Utils.coerce(Internal::Types::Hash[String, Integer], JSON.parse(response.body, symbolize_names: true))"
        );
    });

    it("parses primitive and unknown bodies directly", () => {
        expect(render(stringType())).toBe("JSON.parse(response.body, symbolize_names: true)");
        expect(render(FernIr.TypeReference.unknown())).toBe("JSON.parse(response.body, symbolize_names: true)");
    });
});
