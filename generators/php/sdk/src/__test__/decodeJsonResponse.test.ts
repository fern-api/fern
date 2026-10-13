import { php } from "@fern-api/php-codegen";
import { describe, expect, it } from "vitest";

import { HttpEndpointGenerator } from "../endpoint/http/HttpEndpointGenerator.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const pet = php.classReference({ name: "Pet", namespace: "Seed\\Types" });
const status = php.classReference({ name: "Status", namespace: "Seed\\Types" });

/**
 * A stub of only what `decodeJsonResponse` reads eagerly, cast the way the csharp and rust
 * generator tests stub their context. The union stub dedupes the way the real mapper
 * does for these inputs: two references to the same class collapse into one member.
 */
function generator(): HttpEndpointGenerator {
    const context = {
        isMixedArray: (type: php.Type) =>
            type.internalType.type === "array" &&
            type.internalType.value.underlyingType().internalType.type === "mixed",
        phpAttributeMapper: {
            getUnionTypeParameters: ({ types }: { types: php.Type[] }) =>
                types.filter(
                    (type, index) =>
                        types.findIndex(
                            (other) => JSON.stringify(other.internalType) === JSON.stringify(type.internalType)
                        ) === index
                )
        }
    } as unknown as SdkGeneratorContext;
    return new HttpEndpointGenerator({ context });
}

function carriesPhpstanIgnore(type: php.Type): boolean {
    return generator().decodeJsonResponse(type).carriesPhpstanIgnore;
}

describe("decodeJsonResponse carriesPhpstanIgnore", () => {
    it("is true for the loosely typed decoders", () => {
        expect(carriesPhpstanIgnore(php.Type.array(php.Type.reference(pet)))).toBe(true);
        expect(carriesPhpstanIgnore(php.Type.map(php.Type.string(), php.Type.reference(pet)))).toBe(true);
        expect(carriesPhpstanIgnore(php.Type.enumString(status))).toBe(true);
        expect(carriesPhpstanIgnore(php.Type.union([php.Type.reference(pet), php.Type.string()]))).toBe(true);
    });

    it("is false where the decoder answers the declared type", () => {
        expect(carriesPhpstanIgnore(php.Type.reference(pet))).toBe(false);
        expect(carriesPhpstanIgnore(php.Type.string())).toBe(false);
        expect(carriesPhpstanIgnore(php.Type.array(php.Type.mixed()))).toBe(false);
    });

    it("follows the single member of a union that dedupes to one type", () => {
        expect(carriesPhpstanIgnore(php.Type.union([php.Type.reference(pet), php.Type.reference(pet)]))).toBe(false);
        expect(carriesPhpstanIgnore(php.Type.union([php.Type.enumString(status), php.Type.enumString(status)]))).toBe(
            true
        );
    });
});
