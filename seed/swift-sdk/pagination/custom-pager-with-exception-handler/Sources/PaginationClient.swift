public final class PaginationClient: Sendable {
    public let complex: ComplexClient
    public let users: UsersClient
    private let config: ClientConfig

    public init(baseURL: String = PaginationEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.complex = ComplexClient(config: config)
        self.users = UsersClient(config: config)
    }
}