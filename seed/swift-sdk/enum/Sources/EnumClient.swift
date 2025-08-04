public final class EnumClient: Sendable {
    public let headers: HeadersClient
    public let inlinedRequest: InlinedRequestClient
    public let pathParam: PathParamClient
    public let queryParam: QueryParamClient
    public let unknown: UnknownClient
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
        self.headers = HeadersClient(config: config)
        self.inlinedRequest = InlinedRequestClient(config: config)
        self.pathParam = PathParamClient(config: config)
        self.queryParam = QueryParamClient(config: config)
        self.unknown = UnknownClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}