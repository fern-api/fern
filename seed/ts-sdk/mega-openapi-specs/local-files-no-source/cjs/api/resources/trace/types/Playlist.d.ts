import type * as SeedApi from "../../../index.js";
export interface Playlist extends SeedApi.trace.PlaylistCreateRequest {
    playlist_id: SeedApi.trace.PlaylistId;
    "owner-id": SeedApi.trace.UserId;
}
