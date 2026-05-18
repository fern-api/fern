import type * as SeedApi from "../../../index.mjs";
export interface UnexpectedLanguageError {
    expectedLanguage: SeedApi.trace.Language;
    actualLanguage: SeedApi.trace.Language;
}
