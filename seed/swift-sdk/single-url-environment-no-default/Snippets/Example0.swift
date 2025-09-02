import Foundation
import SingleUrlEnvironmentNoDefault

private func main() async throws {
    let client = SingleUrlEnvironmentNoDefaultClient(token: "<token>")

    try await client.dummy.getDummy()
}

try await main()
