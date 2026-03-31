import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.getToken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret"
    ))
}

try await main()
