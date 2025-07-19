public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMovie(requestOptions: RequestOptions? = nil) async throws -> Movie {
        fatalError("Not implemented.")
    }

    public func createMovie(requestOptions: RequestOptions? = nil) async throws -> MovieId {
        fatalError("Not implemented.")
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) async throws -> Metadata {
        fatalError("Not implemented.")
    }

    public func createBigEntity(requestOptions: RequestOptions? = nil) async throws -> Response {
        fatalError("Not implemented.")
    }
}