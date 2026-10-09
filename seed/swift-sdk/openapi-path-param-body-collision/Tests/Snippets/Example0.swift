import Foundation
import Api

enum Example0 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.updateProfileIdentifier(
            profileId: "profile_123",
            idTypePathParam: "email",
            request: .init(
                idType: "phone",
                oldValue: "+13175556789",
                newValue: "+13175556798"
            )
        )
    }
}
