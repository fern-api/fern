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
}