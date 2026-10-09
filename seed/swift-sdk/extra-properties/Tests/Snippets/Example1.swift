import Foundation
import ExtraProperties

enum Example1 {
    static func snippet() async throws {
        let client = ExtraPropertiesClient(baseURL: "https://api.fern.com")

        _ = try await client.user.createUser(request: .init(
            type: .createUserRequest,
            version: .v1,
            name: "name"
        ))
    }
}
