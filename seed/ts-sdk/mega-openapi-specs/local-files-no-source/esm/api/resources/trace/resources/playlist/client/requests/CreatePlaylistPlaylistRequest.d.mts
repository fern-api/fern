import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         serviceParam: 1,
 *         datetime: "2024-01-15T09:30:00Z",
 *         body: {
 *             name: "name",
 *             problems: ["problems"]
 *         }
 *     }
 */
export interface CreatePlaylistPlaylistRequest {
    serviceParam: number;
    datetime: string;
    optionalDatetime?: string | null;
    body: SeedApi.trace.PlaylistCreateRequest;
}
