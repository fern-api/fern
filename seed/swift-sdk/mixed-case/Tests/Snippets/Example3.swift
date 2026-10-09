import Foundation
import MixedCase

enum Example3 {
    static func snippet() async throws {
        let client = MixedCaseClient(baseURL: "https://api.fern.com")

        _ = try await client.service.listResources(
            pageLimit: 1,
            beforeDate: CalendarDate("2023-01-15")!
        )
    }
}
