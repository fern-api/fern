public final class PlaylistClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createPlaylist(requestOptions: RequestOptions? = nil) async throws -> Playlist {
        fatalError("Not implemented.")
    }

    public func getPlaylists(requestOptions: RequestOptions? = nil) async throws -> [Playlist] {
        fatalError("Not implemented.")
    }

    public func getPlaylist(requestOptions: RequestOptions? = nil) async throws -> Playlist {
        fatalError("Not implemented.")
    }

    public func updatePlaylist(requestOptions: RequestOptions? = nil) async throws -> Playlist {
        fatalError("Not implemented.")
    }

    public func deletePlaylist(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }
}