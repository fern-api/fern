import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.widgets.create(
        apiVersion: "apiVersion",
        request: Widget(
            name: "name"
        )
    )
}

try await main()
