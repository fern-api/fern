import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

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
