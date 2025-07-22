public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMovie(requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            requestOptions: requestOptions
        )
    }

    public func getMovieDocs(requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            requestOptions: requestOptions
        )
    }

    public func getMovieName(requestOptions: RequestOptions? = nil) async throws -> StringResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            requestOptions: requestOptions
        )
    }

    public func getMovieMetadata(requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            requestOptions: requestOptions
        )
    }

    public func getOptionalMovie(requestOptions: RequestOptions? = nil) async throws -> Response? {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            requestOptions: requestOptions
        )
    }

    public func getOptionalMovieDocs(requestOptions: RequestOptions? = nil) async throws -> OptionalWithDocs {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            requestOptions: requestOptions
        )
    }

    public func getOptionalMovieName(requestOptions: RequestOptions? = nil) async throws -> OptionalStringResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            requestOptions: requestOptions
        )
    }
}