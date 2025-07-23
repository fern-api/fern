public final class EmptyClientsClient: Sendable {
    public let level1: Level1Client
    private let config: ClientConfig

    public init(baseURL: String = EmptyClientsEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.level1 = Level1Client(config: config)
    }
}