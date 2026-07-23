import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.updateProfileIdentifier(
            profileId: "profileId",
            idTypePathParam: "idTypePathParam",
            request: .init(
                idType: "idType",
                oldValue: "oldValue",
                newValue: "newValue"
            )
        )
    }
}
