import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.primitive.getAndReturnBase64(request: "SGVsbG8gd29ybGQh")
}

try await main()
