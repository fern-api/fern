import Foundation
import RequestParameters

enum Example3 {
    static func snippet() async throws {
        let client = RequestParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.user.createUsernameOptional(request: .value(CreateUsernameBodyOptionalProperties(
            username: "username",
            password: "password",
            name: "test"
        )))
    }
}
