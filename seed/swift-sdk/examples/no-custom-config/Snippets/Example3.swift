import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.file.notification.service.getException(notificationId: "notification-hsy129x")
}

try await main()
