import Foundation
import Exhaustive

enum Example51 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.primitive.getAndReturnDate(request: CalendarDate("2023-01-15")!)
    }
}
