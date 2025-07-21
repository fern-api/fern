public final class PlaylistClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createPlaylist(serviceParam: String, requestOptions: RequestOptions? = nil) async throws -> Playlist {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/v2/playlist/\(serviceParam)/create", 
            requestOptions: requestOptions
        )
    }

    public func getPlaylists(serviceParam: String, requestOptions: RequestOptions? = nil) async throws -> [Playlist] {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/v2/playlist/\(serviceParam)/all", 
            requestOptions: requestOptions
        )
    }

    public func getPlaylist(serviceParam: String, playlistId: String, requestOptions: RequestOptions? = nil) async throws -> Playlist {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/v2/playlist/\(serviceParam)/\(playlistId)", 
            requestOptions: requestOptions
        )
    }

    public func updatePlaylist(serviceParam: String, playlistId: String, requestOptions: RequestOptions? = nil) async throws -> Playlist {
        return try await httpClient.performRequest(
            method: .put, 
            path: "/v2/playlist/\(serviceParam)/\(playlistId)", 
            requestOptions: requestOptions
        )
    }

    public func deletePlaylist(serviceParam: String, playlistId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .delete, 
            path: "/v2/playlist/\(serviceParam)/\(playlistId)", 
            requestOptions: requestOptions
        )
    }
}