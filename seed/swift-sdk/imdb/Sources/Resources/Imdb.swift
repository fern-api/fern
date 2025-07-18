public final class ImdbClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createMovie(requestOptions: RequestOptions? = nil) async throws -> MovieId {
    }

    public func getMovie(requestOptions: RequestOptions? = nil) async throws -> Movie {
    }
}