public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMovie(requestOptions: RequestOptions? = nil) async throws -> Response {
        fatalError("Not implemented.")
    }

    public func getMovieDocs(requestOptions: RequestOptions? = nil) async throws -> Response {
        fatalError("Not implemented.")
    }

    public func getMovieName(requestOptions: RequestOptions? = nil) async throws -> StringResponse {
        fatalError("Not implemented.")
    }

    public func getMovieMetadata(requestOptions: RequestOptions? = nil) async throws -> Response {
        fatalError("Not implemented.")
    }

    public func getOptionalMovie(requestOptions: RequestOptions? = nil) async throws -> Response {
        fatalError("Not implemented.")
    }

    public func getOptionalMovieDocs(requestOptions: RequestOptions? = nil) async throws -> OptionalWithDocs {
        fatalError("Not implemented.")
    }

    public func getOptionalMovieName(requestOptions: RequestOptions? = nil) async throws -> OptionalStringResponse {
        fatalError("Not implemented.")
    }
}