import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient()

    try await client.service.listResources(request: .init(
        pageLimit: 1,
        beforeDate: try! Date("2023-01-15T00:00:00Z", strategy: .iso8601)
    ))
}

try await main()
