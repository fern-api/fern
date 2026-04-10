import Foundation

public final class PlaylistClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Create a new playlist
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createplaylist(serviceParam: String, datetime: Date, optionalDatetime: Nullable<Date>? = nil, request: PlaylistCreateRequest, requestOptions: RequestOptions? = nil) async throws -> Playlist {
        return try await httpClient.performRequest(
            method: .post,
            path: "/v2/playlist/\(serviceParam)/create",
            queryParams: [
                "datetime": .date(datetime), 
                "optionalDatetime": optionalDatetime?.wrappedValue.map { .date($0) }
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: Playlist.self
        )
    }

    /// Returns the user's playlists
    ///
    /// - Parameter otherField: i'm another field
    /// - Parameter multiLineDocs: I'm a multiline
    /// description
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getplaylists(serviceParam: String, limit: Nullable<Int>? = nil, otherField: String, multiLineDocs: String, optionalMultipleField: Nullable<String>? = nil, multipleField: String? = nil, requestOptions: RequestOptions? = nil) async throws -> [Playlist] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/v2/playlist/\(serviceParam)/all",
            queryParams: [
                "limit": limit?.wrappedValue.map { .int($0) }, 
                "otherField": .string(otherField), 
                "multiLineDocs": .string(multiLineDocs), 
                "optionalMultipleField": optionalMultipleField?.wrappedValue.map { .string($0) }, 
                "multipleField": multipleField.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: [Playlist].self
        )
    }

    /// Returns a playlist
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getplaylist(serviceParam: String, playlistId: String, requestOptions: RequestOptions? = nil) async throws -> Playlist {
        return try await httpClient.performRequest(
            method: .get,
            path: "/v2/playlist/\(serviceParam)/\(playlistId)",
            requestOptions: requestOptions,
            responseType: Playlist.self
        )
    }

    /// Updates a playlist
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateplaylist(serviceParam: String, playlistId: String, request: Requests.UpdatePlaylistRequest, requestOptions: RequestOptions? = nil) async throws -> Playlist {
        return try await httpClient.performRequest(
            method: .put,
            path: "/v2/playlist/\(serviceParam)/\(playlistId)",
            body: request,
            requestOptions: requestOptions,
            responseType: Playlist.self
        )
    }

    /// Deletes a playlist
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func deleteplaylist(serviceParam: String, playlistId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/v2/playlist/\(serviceParam)/\(playlistId)",
            requestOptions: requestOptions
        )
    }
}