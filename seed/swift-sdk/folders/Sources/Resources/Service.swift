public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpoint(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func unknownRequest(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}