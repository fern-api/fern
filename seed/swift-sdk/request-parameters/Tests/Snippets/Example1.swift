import Foundation
import RequestParameters

enum Example1 {
    static func snippet() async throws {
        let client = RequestParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.user.createUsernameWithReferencedType(
            tags: [
                "tags",
                "tags"
            ],
            request: CreateUsernameBody(
                username: "username",
                password: "password",
                name: "test"
            )
        )
    }
}
