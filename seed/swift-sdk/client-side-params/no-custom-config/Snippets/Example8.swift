import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.listConnections(request: .init(
        strategy: "strategy",
        name: "name",
        fields: "fields"
    ))
}

try await main()
