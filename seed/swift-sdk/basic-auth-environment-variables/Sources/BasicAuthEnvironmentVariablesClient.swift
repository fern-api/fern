public final class BasicAuthEnvironmentVariablesClient: Sendable {
    public let basicAuth: BasicAuthClient
    public let errors: ErrorsClient
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
        self.basicAuth = BasicAuthClient(config: config)
        self.errors = ErrorsClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}