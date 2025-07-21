public final class UnknownClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(requestOptions: RequestOptions? = nil) async throws -> [Any] {
        fatalError("Not implemented.")
    }

    public func postObject(requestOptions: RequestOptions? = nil) async throws -> [Any] {
        fatalError("Not implemented.")
    }
}