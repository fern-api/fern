import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient(baseURL: "https://api.fern.com")

    _ = try await client.service.listResources(
        pageLimit: 10,
        beforeDate: CalendarDate("2023-01-01")!
    )
}

try await main()
