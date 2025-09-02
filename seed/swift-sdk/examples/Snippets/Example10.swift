import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    try await client.health.service.ping()
}

try await main()
