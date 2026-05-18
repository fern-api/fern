import type * as SeedApi from "../../../index.js";
export interface Memo {
    description: string;
    account?: (SeedApi.simpleFhir.Account | null) | undefined;
}
