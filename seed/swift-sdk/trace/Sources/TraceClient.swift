/// Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propagate to these functions.
///
/// - Parameter baseURL: The base URL to use for requests from the client. If not provided, the default base URL will be used.
/// - Parameter apiKey: The API key for authentication.
/// - Parameter token: Bearer token for authentication. If provided, will be sent as "Bearer {token}" in Authorization header.
/// - Parameter headers: Additional headers to send with each request.
/// - Parameter timeout: Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided.
/// - Parameter maxRetries: Maximum number of retries for failed requests. Defaults to 2.
/// - Parameter urlSession: Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout.
public final class TraceClient: Sendable {
    public let v2: V2Client
    public let admin: AdminClient
    public let commons: CommonsClient
    public let homepage: HomepageClient
    public let langServer: LangServerClient
    public let migration: MigrationClient
    public let playlist: PlaylistClient
    public let problem: ProblemClient
    public let submission: SubmissionClient
    public let sysprop: SyspropClient
    private let httpClient: HTTPClient

    public init(
        baseURL: String = TraceEnvironment.prod.rawValue,
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
        self.v2 = V2Client(config: config)
        self.admin = AdminClient(config: config)
        self.commons = CommonsClient(config: config)
        self.homepage = HomepageClient(config: config)
        self.langServer = LangServerClient(config: config)
        self.migration = MigrationClient(config: config)
        self.playlist = PlaylistClient(config: config)
        self.problem = ProblemClient(config: config)
        self.submission = SubmissionClient(config: config)
        self.sysprop = SyspropClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}