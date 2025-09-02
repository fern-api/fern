import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    try await client.service.getConnection(
        connectionId: "connectionId",
        request: .init(
            connectionId: "connectionId",
            fields: "fields"
        )
    )
}

try await main()
