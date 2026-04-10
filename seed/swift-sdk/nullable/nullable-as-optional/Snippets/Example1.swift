import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullable.getusers(
        avatar: .value("avatar"),
        extra: .value(true)
    )
}

try await main()
