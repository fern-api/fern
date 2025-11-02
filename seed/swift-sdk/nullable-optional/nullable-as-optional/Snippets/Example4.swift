import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.searchUsers(
        query: "query",
        department: .value("department"),
        role: "role",
        isActive: .value(true)
    )
}

try await main()
