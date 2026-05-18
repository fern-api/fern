import type * as SeedApi from "../../../index.mjs";
export interface Memo {
    description: string;
    account?: (SeedApi.simpleFhir.Account | null) | undefined;
}
