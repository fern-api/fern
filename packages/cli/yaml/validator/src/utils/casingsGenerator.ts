import { constructCasingsGenerator } from "@fern-api/ir-generator";

// Note: using this exported variable is NOT recommended, but its included for convenience
// when the call-site doesn't care about the language nor special casing convention.
export const CASINGS_GENERATOR = constructCasingsGenerator({
    generationLanguage: undefined,
    smartCasing: false
});
