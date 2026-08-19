import Foundation
import MixedCase

enum Example2 {
    static func snippet() async throws {
        let client = MixedCaseClient(baseURL: "https://api.fern.com")

        _ = try await client.service.listResources(
            pageLimit: 10,
            beforeDate: CalendarDate("2023-01-01")!
        )
    }
}
