import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        username: "<username>",
        password: "<password>"
    )

    _ = try await client.basicauth.getwithbasicauth()
}

try await main()
