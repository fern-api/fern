public final class UndiscriminatedUnionsClient: Sendable {
    public let union: UnionClient
    private let config: ClientConfig

    public init(baseURL: String = UndiscriminatedUnionsEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.union = UnionClient(config: config)
    }
}