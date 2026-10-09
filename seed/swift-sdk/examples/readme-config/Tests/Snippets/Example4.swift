import Foundation
import Examples

enum Example4 {
    static func snippet() async throws {
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.file.notification.service.getException(notificationId: "notificationId")
    }
}
