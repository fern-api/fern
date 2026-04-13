import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.getconnection(
        connectionId: "connectionId",
        fields: .value("fields")
    )
}

try await main()
