public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMovie(movieId: String, requestOptions: RequestOptions? = nil) async throws -> Movie {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/movie/\(movieId)", 
            requestOptions: requestOptions
        )
    }

    public func createMovie(requestOptions: RequestOptions? = nil) async throws -> MovieId {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            requestOptions: requestOptions
        )
    }

    public func getMetadata(shallow: Bool? = nil, tag: String? = nil, requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/metadata", 
            requestOptions: requestOptions
        )
    }

    public func createBigEntity(requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/big-entity", 
            requestOptions: requestOptions
        )
    }
}