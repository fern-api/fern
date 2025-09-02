import Foundation
import Alias

private func main() async throws {
    let client = SeedAliasClient()

    try await client.get(typeId: "typeId")
}

try await main()
