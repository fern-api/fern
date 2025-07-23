public final class ApiClient: Sendable {
    public let a: AClient
    public let folder: FolderClient
    private let config: ClientConfig

    public init(baseURL: String = ApiEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.a = AClient(config: config)
        self.folder = FolderClient(config: config)
    }
}