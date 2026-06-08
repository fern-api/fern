import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.widgets.create(
            apiVersion: "apiVersion",
            request: Widget(
                name: "name"
            )
        )
    }
}
