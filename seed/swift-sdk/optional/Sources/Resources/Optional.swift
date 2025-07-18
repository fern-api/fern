public final class OptionalClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func sendOptionalBody(requestOptions: RequestOptions? = nil) async throws -> String {
    }
}