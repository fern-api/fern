import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.getClient(
        clientId: "clientId",
        fields: "fields",
        includeFields: true
    )
}

try await main()
