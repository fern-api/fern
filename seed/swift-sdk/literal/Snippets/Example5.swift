import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient()

    try await client.path.send(id: .value)
}

try await main()
