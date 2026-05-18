import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         serviceParam: 1,
 *         playlistId: "playlistId"
 *     }
 */
export interface GetPlaylistPlaylistRequest {
    serviceParam: number;
    playlistId: SeedApi.trace.PlaylistId;
}
