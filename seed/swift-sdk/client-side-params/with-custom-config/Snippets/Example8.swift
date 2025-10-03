import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.listConnections(
        strategy: "strategy",
        name: "name",
        fields: "fields"
    )
}

try await main()
