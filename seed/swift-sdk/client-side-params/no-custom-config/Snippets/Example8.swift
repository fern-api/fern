import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.createuser(request: .init(
        email: "email",
        connection: "connection"
    ))
}

try await main()
