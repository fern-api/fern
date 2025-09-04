import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient(baseURL: "https://api.fern.com")

    try await client.service.listResources(request: .init(
        pageLimit: 10,
        beforeDate: try! Date("2023-01-01T00:00:00Z", strategy: .iso8601)
    ))
}

try await main()
