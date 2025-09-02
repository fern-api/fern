import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

    try await client.service.deleteUser(userId: "userId")
}

try await main()
