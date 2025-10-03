import Foundation
import ContentTypes

private func main() async throws {
    let client = ContentTypesClient(baseURL: "https://api.fern.com")

    try await client.service.patch(request: .init(
        application: .value("application"),
        requireAuth: .value(true)
    ))
}

try await main()
