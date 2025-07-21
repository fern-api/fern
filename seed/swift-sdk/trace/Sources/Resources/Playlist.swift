public final class PlaylistClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createPlaylist(serviceParam: String, datetime: Date, optionalDatetime: Date? = nil, requestOptions: RequestOptions? = nil) async throws -> Playlist {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/v2/playlist/\(serviceParam)/create", 
            queryParams: [
                "datetime": datetime, 
                "optionalDatetime": optionalDatetime.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func getPlaylists(serviceParam: String, limit: Int? = nil, otherField: String, multiLineDocs: String, optionalMultipleField: String? = nil, multipleField: String, requestOptions: RequestOptions? = nil) async throws -> [Playlist] {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/v2/playlist/\(serviceParam)/all", 
            queryParams: [
                "limit": limit.map { .string($0) }, 
                "otherField": otherField, 
                "multiLineDocs": multiLineDocs, 
                "optionalMultipleField": optionalMultipleField.map { .string($0) }, 
                "multipleField": multipleField
            ], 
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