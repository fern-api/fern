import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.getClient(
        clientId: "clientId",
        fields: "fields",
        includeFields: true
    )
}

try await main()
