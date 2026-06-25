import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { FernIr } from "@fern-api/ir-sdk";

/**
 * A single shared casings generator for the flat GraphQL schema conversion. No casing
 * overrides are configured, so name helpers return plain strings (which satisfy the
 * NameOrString / NameAndWireValueOrString IR types).
 */
export const graphqlCasingsGenerator = constructCasingsGenerator({
    generationLanguage: "typescript",
    keywords: undefined,
    smartCasing: false
});

/**
 * GraphQL schemas are flat (no nested packages), so every type/service shares one
 * root FernFilepath.
 */
export const ROOT_FERN_FILEPATH: FernIr.FernFilepath = {
    allParts: [],
    packagePath: [],
    file: undefined
};
