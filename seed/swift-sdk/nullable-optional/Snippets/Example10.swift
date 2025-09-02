import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient()

    try await client.nullableOptional.getNotificationSettings(userId: "userId")
}

try await main()
