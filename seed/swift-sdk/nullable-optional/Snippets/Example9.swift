import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    try await client.nullableOptional.filterByRole(request: .init(
        role: .admin,
        status: .active,
        secondaryRole: .admin
    ))
}

try await main()
