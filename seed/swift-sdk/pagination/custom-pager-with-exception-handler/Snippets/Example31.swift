import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listwithbodycursorpagination(request: .init(pagination: WithCursor(
        cursor: .value("cursor")
    )))
}

try await main()
