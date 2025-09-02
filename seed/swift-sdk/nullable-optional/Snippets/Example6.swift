import Foundation
import NullableOptional

private func main() async throws {
    let client = SeedNullableOptionalClient()

    try await client.nullableOptional.getComplexProfile(profileId: "profileId")
}

try await main()
