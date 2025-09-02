import Foundation
import CustomAuth

private func main() async throws {
    let client = SeedCustomAuthClient(customAuthScheme: "<value>")

    try await client.customAuth.getWithCustomAuth()
}

try await main()
