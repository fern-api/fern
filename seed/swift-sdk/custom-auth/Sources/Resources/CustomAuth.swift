public final class CustomAuthClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithCustomAuth(requestOptions: RequestOptions? = nil) throws -> Bool {
    }

    public func postWithCustomAuth(requestOptions: RequestOptions? = nil) throws -> Bool {
    }
}