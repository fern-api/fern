import type * as SeedApi from "../../../index.js";
export interface UnexpectedLanguageError {
    expectedLanguage: SeedApi.trace.Language;
    actualLanguage: SeedApi.trace.Language;
}
