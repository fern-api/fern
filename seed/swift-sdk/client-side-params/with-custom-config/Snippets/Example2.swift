import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    try await client.service.searchResources(request: .init(
        limit: 1,
        offset: 1,
        query: "query",
        filters: [
            "filters": .object([
                "key": .string("value")
            ])
        ]
    ))
}

try await main()
