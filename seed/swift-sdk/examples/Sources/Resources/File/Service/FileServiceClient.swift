public final class FileServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getFile(filename: String, requestOptions: RequestOptions? = nil) async throws -> File {
        return try await httpClient.performRequest(
            method: .get,
            path: "/file/\(filename)",
            requestOptions: requestOptions,
            responseType: File.self
        )
    }
}