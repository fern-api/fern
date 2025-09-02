import Foundation
import ClientSideParams

private func main() async throws {
    let client = SeedClientSideParamsClient(token: "<token>")

    try await client.service.listConnections(request: .init(
        strategy: "strategy",
        name: "name",
        fields: "fields"
    ))
}

try await main()
