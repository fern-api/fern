import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.searchUsers(
        query: "query",
        department: "department",
        role: "role",
        isActive: true
    )
}

try await main()
