import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import * as SeedApi from "../../../../../index.js";
export declare namespace PlaylistClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PlaylistClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PlaylistClient.Options>;
    constructor(options: PlaylistClient.Options);
    /**
     * Create a new playlist
     *
     * @param {SeedApi.trace.CreatePlaylistPlaylistRequest} request
     * @param {PlaylistClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.playlist.createPlaylist({
     *         serviceParam: 1,
     *         datetime: "2024-01-15T09:30:00Z",
     *         body: {
     *             name: "name",
     *             problems: ["problems"]
     *         }
     *     })
     */
    createPlaylist(request: SeedApi.trace.CreatePlaylistPlaylistRequest, requestOptions?: PlaylistClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.Playlist>;
    private __createPlaylist;
    /**
     * Returns the user's playlists
     *
     * @param {SeedApi.trace.GetPlaylistsPlaylistRequest} request
     * @param {PlaylistClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.playlist.getPlaylists({
     *         serviceParam: 1,
     *         otherField: "otherField",
     *         multiLineDocs: "multiLineDocs",
     *         multipleField: ["multipleField"]
     *     })
     */
    getPlaylists(request: SeedApi.trace.GetPlaylistsPlaylistRequest, requestOptions?: PlaylistClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.Playlist[]>;
    private __getPlaylists;
    /**
     * Returns a playlist
     *
     * @param {SeedApi.trace.GetPlaylistPlaylistRequest} request
     * @param {PlaylistClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.trace.UnauthorizedError}
     * @throws {@link SeedApi.trace.NotFoundError}
     *
     * @example
     *     await client.trace.playlist.getPlaylist({
     *         serviceParam: 1,
     *         playlistId: "playlistId"
     *     })
     */
    getPlaylist(request: SeedApi.trace.GetPlaylistPlaylistRequest, requestOptions?: PlaylistClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.Playlist>;
    private __getPlaylist;
    /**
     * Updates a playlist
     *
     * @param {SeedApi.trace.UpdatePlaylistPlaylistRequest} request
     * @param {PlaylistClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.trace.NotFoundError}
     *
     * @example
     *     await client.trace.playlist.updatePlaylist({
     *         serviceParam: 1,
     *         playlistId: "playlistId",
     *         body: {
     *             name: "name",
     *             problems: ["problems"]
     *         }
     *     })
     */
    updatePlaylist(request: SeedApi.trace.UpdatePlaylistPlaylistRequest, requestOptions?: PlaylistClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.Playlist | null>;
    private __updatePlaylist;
    /**
     * Deletes a playlist
     *
     * @param {SeedApi.trace.DeletePlaylistPlaylistRequest} request
     * @param {PlaylistClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.playlist.deletePlaylist({
     *         serviceParam: 1,
     *         playlist_id: "playlist_id"
     *     })
     */
    deletePlaylist(request: SeedApi.trace.DeletePlaylistPlaylistRequest, requestOptions?: PlaylistClient.RequestOptions): core.HttpResponsePromise<void>;
    private __deletePlaylist;
}
