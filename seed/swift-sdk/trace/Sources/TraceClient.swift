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
    private let config: ClientConfig

    public init(baseURL: String = TraceEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(
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
    }
}