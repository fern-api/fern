import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         serviceParam: 1,
 *         playlist_id: "playlist_id"
 *     }
 */
export interface DeletePlaylistPlaylistRequest {
    serviceParam: number;
    playlist_id: SeedApi.trace.PlaylistId;
}
