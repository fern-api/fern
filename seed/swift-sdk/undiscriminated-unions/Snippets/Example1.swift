import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = SeedUndiscriminatedUnionsClient()

    try await client.union.getMetadata()
}

try await main()
