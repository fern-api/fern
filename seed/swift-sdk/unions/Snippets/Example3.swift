import Foundation
import Unions

private func main() async throws {
    let client = SeedUnionsClient()

    try await client.bigunion.get(id: "id")
}

try await main()
