import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient(baseURL: "https://api.fern.com")

    try await client.service.listResources(request: .init(
        pageLimit: 10,
        beforeDate: try! CalendarDate("2023-01-01")
    ))
}

try await main()
