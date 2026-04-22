import Foundation
import NoEnvironment

private func main() async throws {
    let client = NoEnvironmentClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.dummy.getDummy()
}

try await main()
