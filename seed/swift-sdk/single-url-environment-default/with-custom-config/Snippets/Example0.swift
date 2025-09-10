import Foundation
import SingleUrlEnvironmentDefault

private func main() async throws {
    let client = SingleUrlEnvironmentDefaultClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.dummy.getDummy()
}

try await main()
