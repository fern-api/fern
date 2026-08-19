import Foundation
import Unions

enum Example6 {
    static func snippet() async throws {
        let client = UnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.types.update(request: UnionWithTime.date(
            CalendarDate("1994-01-01")!
        ))
    }
}
