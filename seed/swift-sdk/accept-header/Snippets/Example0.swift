import Foundation
import Accept

private func main() async throws {
    let client = AcceptClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.endpoint()
}

try await main()
