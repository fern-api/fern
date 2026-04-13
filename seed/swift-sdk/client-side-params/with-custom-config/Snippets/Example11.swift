import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.getuserbyid(
        userId: "userId",
        fields: .value("fields"),
        includeFields: .value(true)
    )
}

try await main()
