import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.listUsers(
        limit: 1,
        offset: 1,
        includeDeleted: true,
        sortBy: "sortBy"
    )
}

try await main()
