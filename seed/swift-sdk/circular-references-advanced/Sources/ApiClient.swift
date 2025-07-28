public final class ApiClient: Sendable {
    public let a: AClient
    public let ast: AstClient
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
        self.a = AClient(config: config)
        self.ast = AstClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}