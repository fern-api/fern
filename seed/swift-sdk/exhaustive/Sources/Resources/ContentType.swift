public final class ContentTypeClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func postJsonPatchContentType(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func postJsonPatchContentWithCharsetType(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}