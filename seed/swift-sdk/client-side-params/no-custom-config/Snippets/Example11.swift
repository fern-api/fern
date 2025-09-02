import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    try await client.service.getClient(
        clientId: "clientId",
        request: .init(
            clientId: "clientId",
            fields: "fields",
            includeFields: True
        )
    )
}

try await main()
