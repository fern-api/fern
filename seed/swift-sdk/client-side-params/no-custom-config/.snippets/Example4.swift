import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.getUserById(
        userId: "userId",
        fields: "fields",
        includeFields: true
    )
}

try await main()
