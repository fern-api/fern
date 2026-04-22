import Foundation
import UndiscriminatedUnionWithResponseProperty

private func main() async throws {
    let client = UndiscriminatedUnionWithResponsePropertyClient(baseURL: "https://api.fern.com")

    _ = try await client.listUnions()
}

try await main()
