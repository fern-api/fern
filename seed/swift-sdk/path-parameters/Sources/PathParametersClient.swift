public final class PathParametersClient: Sendable {
    public let organizations: OrganizationsClient
    public let user: UserClient
    private let config: ClientConfig

    public init(baseURL: String = PathParametersEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.organizations = OrganizationsClient(config: config)
        self.user = UserClient(config: config)
    }
}