import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.filterByRole(
        role: .value(.admin),
        status: .active,
        secondaryRole: .value(.admin)
    )
}

try await main()
