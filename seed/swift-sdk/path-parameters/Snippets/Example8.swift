import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    _ = try await client.user.getUserSpecifics(
        userId: "user_id",
        version: 1,
        thought: "thought"
    )
}

try await main()
