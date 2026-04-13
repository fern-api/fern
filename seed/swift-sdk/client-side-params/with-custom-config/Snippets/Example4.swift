import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.searchresources(
        limit: 1,
        offset: 1,
        request: .init()
    )
}

try await main()
