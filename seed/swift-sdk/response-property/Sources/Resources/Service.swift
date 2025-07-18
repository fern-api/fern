public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMovie(requestOptions: RequestOptions? = nil) async throws -> Response {
    }

    public func getMovieDocs(requestOptions: RequestOptions? = nil) async throws -> Response {
    }

    public func getMovieName(requestOptions: RequestOptions? = nil) async throws -> StringResponse {
    }

    public func getMovieMetadata(requestOptions: RequestOptions? = nil) async throws -> Response {
    }

    public func getOptionalMovie(requestOptions: RequestOptions? = nil) async throws -> Response {
    }

    public func getOptionalMovieDocs(requestOptions: RequestOptions? = nil) async throws -> OptionalWithDocs {
    }

    public func getOptionalMovieName(requestOptions: RequestOptions? = nil) async throws -> OptionalStringResponse {
    }
}