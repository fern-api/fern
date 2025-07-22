public final class BasicAuthClient: Sendable {
    public let basicAuth: BasicAuthClient
    public let errors: ErrorsClient
    private let config: ClientConfig

    public init(baseURL: String = BasicAuthEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.basicAuth = BasicAuthClient(config: config)
        self.errors = ErrorsClient(config: config)
    }
}