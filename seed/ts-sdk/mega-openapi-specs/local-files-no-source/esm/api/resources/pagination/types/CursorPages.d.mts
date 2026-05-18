import type * as SeedApi from "../../../index.mjs";
export interface CursorPages {
    next?: (SeedApi.pagination.StartingAfterPaging | null) | undefined;
    page?: (number | null) | undefined;
    per_page?: (number | null) | undefined;
    total_pages?: (number | null) | undefined;
    type: CursorPages.Type;
}
export declare namespace CursorPages {
    const Type: {
        readonly Pages: "pages";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
