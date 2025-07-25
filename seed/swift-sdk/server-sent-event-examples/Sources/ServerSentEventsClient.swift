public final class ServerSentEventsClient: Sendable {
    public let completions: CompletionsClient
    private let config: ClientConfig

    public init(baseURL: String = ServerSentEventsEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.completions = CompletionsClient(config: config)
    }
}