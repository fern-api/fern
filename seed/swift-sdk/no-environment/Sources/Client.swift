public final class NoEnvironmentClient: Sendable {
    public let dummy: DummyClient
    private let config: ClientConfig

    public init(baseURL: String = NoEnvironmentEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.dummy = DummyClient(config: config)
    }
}