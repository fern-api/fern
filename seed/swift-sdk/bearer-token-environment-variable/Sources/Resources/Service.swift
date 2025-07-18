public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithBearerToken(requestOptions: RequestOptions? = nil) throws -> String {
    }
}