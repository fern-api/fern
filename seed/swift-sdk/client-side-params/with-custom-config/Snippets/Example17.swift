import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.listconnections(
        strategy: .value("strategy"),
        name: .value("name"),
        fields: .value("fields")
    )
}

try await main()
