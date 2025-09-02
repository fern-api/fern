import Foundation
import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.file.notification.service.getException(notificationId: "notificationId")
}

try await main()
