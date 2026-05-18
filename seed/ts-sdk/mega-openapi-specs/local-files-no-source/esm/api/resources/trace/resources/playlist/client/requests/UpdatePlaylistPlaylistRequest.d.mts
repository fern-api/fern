import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         serviceParam: 1,
 *         playlistId: "playlistId",
 *         body: {
 *             name: "name",
 *             problems: ["problems"]
 *         }
 *     }
 */
export interface UpdatePlaylistPlaylistRequest {
    serviceParam: number;
    playlistId: SeedApi.trace.PlaylistId;
    body: SeedApi.trace.UpdatePlaylistRequest | null;
}
