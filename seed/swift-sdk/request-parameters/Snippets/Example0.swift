import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient(baseURL: "https://api.fern.com")

    _ = try await client.user.createUsername(
        tags: [
            "tags",
            "tags"
        ],
        request: .init(
            username: "username",
            password: "password",
            name: "test"
        )
    )
}

try await main()
