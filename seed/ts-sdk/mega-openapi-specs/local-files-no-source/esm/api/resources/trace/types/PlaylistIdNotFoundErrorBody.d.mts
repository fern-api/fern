import type * as SeedApi from "../../../index.mjs";
export interface PlaylistIdNotFoundErrorBody {
    type: PlaylistIdNotFoundErrorBody.Type;
    value?: SeedApi.trace.PlaylistId | undefined;
}
export declare namespace PlaylistIdNotFoundErrorBody {
    const Type: {
        readonly PlaylistId: "playlistId";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
