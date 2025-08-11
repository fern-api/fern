public final class NestedNoAuthClient: Sendable {
    public let api: ApiClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.api = ApiClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}