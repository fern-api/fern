import type * as SeedApi from "../../../index.mjs";
export interface Movie {
    id: SeedApi.examples.MovieId;
    prequel?: (SeedApi.examples.MovieId | null) | undefined;
    title: string;
    from: string;
    /** The rating scale is one to five stars */
    rating: number;
    type: Movie.Type;
    tag: SeedApi.examples.CommonsTag;
    book?: (string | null) | undefined;
    metadata: Record<string, unknown>;
    revenue: number;
}
export declare namespace Movie {
    const Type: {
        readonly Movie: "movie";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
