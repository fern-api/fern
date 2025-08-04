public final class PaginationClient: Sendable {
    public let complex: ComplexClient
    public let users: UsersClient
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
        self.complex = ComplexClient(config: config)
        self.users = UsersClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}