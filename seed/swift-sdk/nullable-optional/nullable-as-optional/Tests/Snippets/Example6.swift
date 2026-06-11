import Foundation
import NullableOptional

enum Example6 {
    static func snippet() async throws {
        let client = NullableOptionalClient(baseURL: "https://api.fern.com")

        _ = try await client.nullableOptional.getComplexProfile(profileId: "profileId")
    }
}
