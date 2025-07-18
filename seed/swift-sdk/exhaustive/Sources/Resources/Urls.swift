public final class UrlsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func withMixedCase(requestOptions: RequestOptions? = nil) async throws -> String {
    }

    public func noEndingSlash(requestOptions: RequestOptions? = nil) async throws -> String {
    }

    public func withEndingSlash(requestOptions: RequestOptions? = nil) async throws -> String {
    }

    public func withUnderscores(requestOptions: RequestOptions? = nil) async throws -> String {
    }
}