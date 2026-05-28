import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.widgets.create(
        apiVersion: "v1beta",
        request: Widget(
            name: "name"
        )
    )
}

try await main()
