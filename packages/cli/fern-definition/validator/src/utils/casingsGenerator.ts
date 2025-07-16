import { constructCasingsGenerator } from "@fern-api/casings-generator"

// Note: using this exported variable is NOT recommended, but its included for convenience
// when the call-site doesn't care about the language nor special casing convention.
export const CASINGS_GENERATOR = constructCasingsGenerator({
    generationLanguage: undefined,
    keywords: undefined,
    smartCasing: false
})
