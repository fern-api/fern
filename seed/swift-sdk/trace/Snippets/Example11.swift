import Trace

let client = SeedTraceClient(token: "<token>")

try await client.migration.getAttemptedMigrations(
    request: .init(adminKeyHeader: "admin-key-header")
)
