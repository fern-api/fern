import Foundation
import MixedCase

private func main() async throws {
    let client = SeedMixedCaseClient()

    try await client.service.listResources(request: .init(
        pageLimit: 1,
        beforeDate: Date(timeIntervalSince1970: 1673740800)
    ))
}

try await main()
