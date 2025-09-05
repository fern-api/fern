import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.migration.getAttemptedMigrations(request: .init(adminKeyHeader: "admin-key-header"))
}

try await main()
