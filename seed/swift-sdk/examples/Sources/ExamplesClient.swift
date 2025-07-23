public final class ExamplesClient: Sendable {
    public let commons: CommonsClient
    public let file: FileClient
    public let health: HealthClient
    public let service: ServiceClient
    public let types: TypesClient
    private let config: ClientConfig

    public init(
        baseURL: String = ExamplesEnvironment.default.rawValue,
        apiKey qpiKey: String,
        token: String? = nil,
        headers: [String: String]? = [:],
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        self.config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.commons = CommonsClient(config: config)
        self.file = FileClient(config: config)
        self.health = HealthClient(config: config)
        self.service = ServiceClient(config: config)
        self.types = TypesClient(config: config)
    }
}