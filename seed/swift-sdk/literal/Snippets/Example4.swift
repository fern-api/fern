import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

    _ = try await client.path.send(id: .value)
}

try await main()
