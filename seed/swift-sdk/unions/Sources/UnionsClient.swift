public final class UnionsClient: Sendable {
    public let bigunion: BigunionClient
    public let types: TypesClient
    public let union: UnionClient
    private let config: ClientConfig

    public init(baseURL: String = UnionsEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.bigunion = BigunionClient(config: config)
        self.types = TypesClient(config: config)
        self.union = UnionClient(config: config)
    }
}