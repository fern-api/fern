import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    try await client.service.getConnection(
        connectionId: "connectionId",
        request: .init(
            connectionId: "connectionId",
            fields: "fields"
        )
    )
}

try await main()
