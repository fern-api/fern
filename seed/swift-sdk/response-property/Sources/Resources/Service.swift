public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMovie(requestOptions: RequestOptions? = nil) throws -> Response {
    }

    public func getMovieDocs(requestOptions: RequestOptions? = nil) throws -> Response {
    }

    public func getMovieName(requestOptions: RequestOptions? = nil) throws -> StringResponse {
    }

    public func getMovieMetadata(requestOptions: RequestOptions? = nil) throws -> Response {
    }

    public func getOptionalMovie(requestOptions: RequestOptions? = nil) throws -> Response {
    }

    public func getOptionalMovieDocs(requestOptions: RequestOptions? = nil) throws -> OptionalWithDocs {
    }

    public func getOptionalMovieName(requestOptions: RequestOptions? = nil) throws -> OptionalStringResponse {
    }
}