import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    try await client.service.listConnections(request: .init(
        strategy: "strategy",
        name: "name",
        fields: "fields"
    ))
}

try await main()
