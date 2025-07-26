public final class MigrationClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAttemptedMigrations(adminKeyHeader: String, requestOptions: RequestOptions? = nil) async throws -> [Migration] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/migration-info/all",
            headers: [
                "admin-key-header": adminKeyHeader
            ],
            requestOptions: requestOptions,
            responseType: [Migration].self
        )
    }
}