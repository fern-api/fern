public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func upload(request: Data, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performFileUpload(
            method: .post,
            path: "/upload-content",
            fileData: request,
            requestOptions: requestOptions
        )
    }
}