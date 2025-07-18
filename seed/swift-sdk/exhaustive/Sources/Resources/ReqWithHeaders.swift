public final class ReqWithHeadersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithCustomHeader(requestOptions: RequestOptions? = nil) throws -> Any {
    }
}