import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.auth.gettoken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret"
    ))
}

try await main()
