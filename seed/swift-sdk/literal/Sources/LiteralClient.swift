public final class LiteralClient: Sendable {
    public let headers: HeadersClient
    public let inlined: InlinedClient
    public let path: PathClient
    public let query: QueryClient
    public let reference: ReferenceClient
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
        self.httpClient = HTTPClient(config: config)
        self.headers = HeadersClient(config: config)
        self.inlined = InlinedClient(config: config)
        self.path = PathClient(config: config)
        self.query = QueryClient(config: config)
        self.reference = ReferenceClient(config: config)
    }
}