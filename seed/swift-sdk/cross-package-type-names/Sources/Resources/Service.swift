public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getDirectThread(requestOptions: RequestOptions? = nil) async throws -> Response {
        fatalError("Not implemented.")
    }
}