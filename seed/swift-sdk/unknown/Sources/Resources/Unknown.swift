public final class UnknownClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(requestOptions: RequestOptions? = nil) throws -> [Any] {
    }

    public func postObject(requestOptions: RequestOptions? = nil) throws -> [Any] {
    }
}