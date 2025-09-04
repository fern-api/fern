import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

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
