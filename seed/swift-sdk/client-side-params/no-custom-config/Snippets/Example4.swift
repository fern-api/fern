import Foundation
import ClientSideParams

private func main() async throws {
    let client = SeedClientSideParamsClient(token: "<token>")

    try await client.service.getUserById(
        userId: "userId",
        request: .init(
            userId: "userId",
            fields: "fields",
            includeFields: True
        )
    )
}

try await main()
