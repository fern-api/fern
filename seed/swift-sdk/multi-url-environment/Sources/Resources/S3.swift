public final class S3Client: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getPresignedUrl(requestOptions: RequestOptions? = nil) throws -> String {
    }
}