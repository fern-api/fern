import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    try await client.nullableOptional.listUsers(request: .init(
        limit: 1,
        offset: 1,
        includeDeleted: True,
        sortBy: "sortBy"
    ))
}

try await main()
