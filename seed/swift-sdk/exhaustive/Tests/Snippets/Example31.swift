import Foundation
import Exhaustive

enum Example31 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.object.getAndReturnWithDatetimeLikeString(request: ObjectWithDatetimeLikeString(
            datetimeLikeString: "datetimeLikeString",
            actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
        ))
    }
}
