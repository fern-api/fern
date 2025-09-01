import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.migration.getAttemptedMigrations(
        request: .init(adminKeyHeader: "admin-key-header")
    )
}

try await main()
