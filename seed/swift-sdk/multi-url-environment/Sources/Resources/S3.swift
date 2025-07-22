public final class S3Client: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getPresignedUrl(request: Any, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/s3/presigned-url", 
            body: request, 
            requestOptions: requestOptions
        )
    }
}