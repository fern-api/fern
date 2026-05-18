import type * as SeedApi from "../../../index.mjs";
export interface Movie {
    id: SeedApi.tsExpressCasing.MovieId;
    title: string;
    /** The rating scale is one to five stars */
    rating: number;
}
