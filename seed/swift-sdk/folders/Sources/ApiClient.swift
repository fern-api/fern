public final class ApiClient: Sendable {
    public let a: AClient
    public let folder: FolderClient
    private let httpClient: HTTPClient

    public init(
        baseURL: String,
        apiKey: String,
        token: String? = nil,
        headers: [String: String]? = [:],
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        let config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.a = AClient(config: config)
        self.folder = FolderClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    public func foo(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            requestOptions: requestOptions
        )
    }
}