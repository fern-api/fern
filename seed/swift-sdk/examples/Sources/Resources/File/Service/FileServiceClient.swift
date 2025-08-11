public final class FileServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// This endpoint returns a file by its name.
    ///
    /// - Parameter filename: This is a filename
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getFile(filename: String, requestOptions: RequestOptions? = nil) async throws -> File {
        return try await httpClient.performRequest(
            method: .get,
            path: "/file/\(filename)",
            requestOptions: requestOptions,
            responseType: File.self
        )
    }
}