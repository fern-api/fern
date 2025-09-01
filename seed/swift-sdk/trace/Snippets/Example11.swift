import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.migration.getAttemptedMigrations(request: .init(adminKeyHeader: "admin-key-header"))
}

try await main()
