public final class MetadataClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) async throws -> Metadata {
        fatalError("Not implemented.")
    }
}