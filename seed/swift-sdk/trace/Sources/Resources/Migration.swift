public final class MigrationClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAttemptedMigrations(requestOptions: RequestOptions? = nil) throws -> [Migration] {
    }
}