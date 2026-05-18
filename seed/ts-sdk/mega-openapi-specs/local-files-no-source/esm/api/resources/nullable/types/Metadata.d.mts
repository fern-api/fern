import type * as SeedApi from "../../../index.mjs";
export interface Metadata {
    createdAt: string;
    updatedAt: string;
    avatar: string | null;
    activated?: (boolean | null) | undefined;
    status: SeedApi.nullable.Status;
    values?: (Record<string, string | null> | null) | undefined;
}
