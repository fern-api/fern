public final class WebsocketClient: Sendable {
    public let realtime: RealtimeClient
    private let config: ClientConfig

    public init(baseURL: String = WebsocketEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.realtime = RealtimeClient(config: config)
    }
}