import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient(baseURL: "https://api.fern.com")

    try await client.user.createUsernameWithReferencedType(request: .init(
        tags: [
            "tags",
            "tags"
        ],
        body: CreateUsernameBody(
            username: "username",
            password: "password",
            name: "test"
        )
    ))
}

try await main()
