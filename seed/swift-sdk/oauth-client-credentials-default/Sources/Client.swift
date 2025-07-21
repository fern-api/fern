public final class OauthClientCredentialsDefaultClient: Sendable {
    public let auth: AuthClient
    private let config: ClientConfig

    public init(baseURL: String = OauthClientCredentialsDefaultEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.auth = AuthClient(config: config)
    }
}