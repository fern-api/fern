import Foundation
import SingleUrlEnvironmentNoDefault

private func main() async throws {
    let client = SingleUrlEnvironmentNoDefaultClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.dummy.getDummy()
}

try await main()
