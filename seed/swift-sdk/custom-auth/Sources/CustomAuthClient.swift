public final class CustomAuthClient: Sendable {
    public let customAuth: CustomAuthClient
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
        self.customAuth = CustomAuthClient(config: config)
        self.errors = ErrorsClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}