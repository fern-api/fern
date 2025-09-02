import Foundation
import SingleUrlEnvironmentDefault

private func main() async throws {
    let client = SeedSingleUrlEnvironmentDefaultClient(token: "<token>")

    try await client.dummy.getDummy()
}

try await main()
