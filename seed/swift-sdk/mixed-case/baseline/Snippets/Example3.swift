import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient(baseURL: "https://api.fern.com")

    _ = try await client.service.listResources(
        pageLimit: 1,
        beforeDate: CalendarDate("2023-01-15")!
    )
}

try await main()
