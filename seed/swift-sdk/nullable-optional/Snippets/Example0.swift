import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    try await client.nullableOptional.getUser(userId: "userId")
}

try await main()
