import Foundation
import ContentTypes

enum Example0 {
    static func snippet() async throws {
        let client = ContentTypesClient(baseURL: "https://api.fern.com")

        _ = try await client.service.patch(request: .init(
            application: .value("application"),
            requireAuth: .value(true)
        ))
    }
}
