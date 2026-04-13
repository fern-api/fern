import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.listusers(
        limit: .value(1),
        offset: .value(1),
        includeDeleted: .value(true),
        sortBy: .value("sortBy")
    )
}

try await main()
