import Foundation
import AnyAuth

private func main() async throws {
    let client = AnyAuthClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.user.get()
}

try await main()
