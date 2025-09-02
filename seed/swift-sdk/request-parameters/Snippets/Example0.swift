import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient()

    try await client.user.createUsername(request: .init(
        tags: [
            "tags",
            "tags"
        ],
        username: "username",
        password: "password",
        name: "test"
    ))
}

try await main()
