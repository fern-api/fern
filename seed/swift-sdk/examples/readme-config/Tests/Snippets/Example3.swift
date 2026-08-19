import Foundation
import Examples

enum Example3 {
    static func snippet() async throws {
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.file.notification.service.getException(notificationId: "notification-hsy129x")
    }
}
