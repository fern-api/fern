import Foundation

public final class MigrationClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.migration.getAttemptedMigrations(adminKeyHeader: "admin-key-header")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
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