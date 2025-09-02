import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(token: "<token>")

    try await client.service.deleteUser(userId: "userId")
}

try await main()
