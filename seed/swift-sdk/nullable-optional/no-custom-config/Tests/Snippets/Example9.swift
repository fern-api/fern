import Foundation
import NullableOptional

enum Example9 {
    static func snippet() async throws {
        let client = NullableOptionalClient(baseURL: "https://api.fern.com")

        _ = try await client.nullableOptional.filterByRole(
            role: .value(.admin),
            status: .active,
            secondaryRole: .value(.admin)
        )
    }
}
