import Foundation
import ClientSideParams

private func main() async throws {
    let client = SeedClientSideParamsClient(token: "<token>")

    try await client.service.getConnection(
        connectionId: "connectionId",
        request: .init(
            connectionId: "connectionId",
            fields: "fields"
        )
    )
}

try await main()
