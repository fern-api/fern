import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient()

    try await client.service.getResource(resourceId: "ResourceID")
}

try await main()
