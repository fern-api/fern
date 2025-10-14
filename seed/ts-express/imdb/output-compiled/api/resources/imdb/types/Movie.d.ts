import type * as SeedApi from "../../../index";
export interface Movie {
    id: SeedApi.MovieId;
    title: string;
    /** The rating scale is one to five stars */
    rating: number;
}
