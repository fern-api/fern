public final class ImdbClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createMovie(requestOptions: RequestOptions? = nil) async throws -> MovieId {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movies/create-movie", 
            requestOptions: requestOptions
        )
    }

    public func getMovie(movieId: String, requestOptions: RequestOptions? = nil) async throws -> Movie {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/movies/\(movieId)", 
            requestOptions: requestOptions
        )
    }
}