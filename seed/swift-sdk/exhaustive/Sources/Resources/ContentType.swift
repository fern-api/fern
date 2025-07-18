public final class ContentTypeClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func postJsonPatchContentType(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func postJsonPatchContentWithCharsetType(requestOptions: RequestOptions? = nil) throws -> Any {
    }
}