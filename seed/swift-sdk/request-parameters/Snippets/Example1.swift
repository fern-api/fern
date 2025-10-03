import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient(baseURL: "https://api.fern.com")

    try await client.user.createUsernameWithReferencedType(
        tags: [
            "tags",
            "tags"
        ],
        request: .init(body: CreateUsernameBody(
            username: "username",
            password: "password",
            name: "test"
        ))
    )
}

try await main()
