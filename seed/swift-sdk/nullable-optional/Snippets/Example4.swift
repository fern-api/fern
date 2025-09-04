import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    try await client.nullableOptional.searchUsers(request: .init(
        query: "query",
        department: "department",
        role: "role",
        isActive: True
    ))
}

try await main()
