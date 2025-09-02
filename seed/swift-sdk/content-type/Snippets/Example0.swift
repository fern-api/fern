import Foundation
import ContentTypes

private func main() async throws {
    let client = ContentTypesClient()

    try await client.service.patch(request: .init(
        application: "application",
        requireAuth: True
    ))
}

try await main()
