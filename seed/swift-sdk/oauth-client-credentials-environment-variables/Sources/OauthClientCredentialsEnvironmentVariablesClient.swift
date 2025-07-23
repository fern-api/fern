public final class OauthClientCredentialsEnvironmentVariablesClient: Sendable {
    public let auth: AuthClient
    private let config: ClientConfig

    public init(
        baseURL: String,
        apiKey qpiKey: String,
        token: String? = nil,
        headers: [String: String]? = [:],
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        self.config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.auth = AuthClient(config: config)
    }
}