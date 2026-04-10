import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listwithextendedresultsandoptionaldata(cursor: .value("cursor"))
}

try await main()
