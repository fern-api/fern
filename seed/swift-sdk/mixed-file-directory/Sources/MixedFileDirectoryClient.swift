public final class MixedFileDirectoryClient: Sendable {
    public let organization: OrganizationClient
    public let user: UserClient
    private let config: ClientConfig

    public init(
        baseURL: String,
        apiKey: String,
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
        self.organization = OrganizationClient(config: config)
        self.user = UserClient(config: config)
    }
}