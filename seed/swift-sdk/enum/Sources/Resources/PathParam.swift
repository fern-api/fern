public final class PathParamClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}