public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getText(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }
}