import type * as SeedApi from "../../../index.mjs";
export interface V2FunctionImplementationForMultipleLanguages {
    codeByLanguage: Record<string, SeedApi.trace.V2FunctionImplementation>;
}
