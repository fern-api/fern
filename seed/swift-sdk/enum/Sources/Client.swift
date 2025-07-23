public final class EnumClient: Sendable {
    public let headers: HeadersClient
    public let inlinedRequest: InlinedRequestClient
    public let pathParam: PathParamClient
    public let queryParam: QueryParamClient
    public let unknown: UnknownClient
    private let config: ClientConfig

    public init(baseURL: String = EnumEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.headers = HeadersClient(config: config)
        self.inlinedRequest = InlinedRequestClient(config: config)
        self.pathParam = PathParamClient(config: config)
        self.queryParam = QueryParamClient(config: config)
        self.unknown = UnknownClient(config: config)
    }
}