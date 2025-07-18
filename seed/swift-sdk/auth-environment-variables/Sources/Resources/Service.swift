public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithApiKey(requestOptions: RequestOptions? = nil) throws -> String {
    }

    public func getWithHeader(requestOptions: RequestOptions? = nil) throws -> String {
    }
}