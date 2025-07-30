public final class UnionsClient: Sendable {
    public let bigunion: BigunionClient
    public let types: TypesClient
    public let union: UnionClient
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
        self.bigunion = BigunionClient(config: config)
        self.types = TypesClient(config: config)
        self.union = UnionClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}