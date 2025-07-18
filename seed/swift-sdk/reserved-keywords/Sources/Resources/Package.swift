public final class PackageClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func test(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}