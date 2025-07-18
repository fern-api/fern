public final class QueryParamClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func sendList(requestOptions: RequestOptions? = nil) throws -> Any {
    }
}