import Foundation
import Unions

enum Example8 {
    static func snippet() async throws {
        let client = UnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.types.update(request: UnionWithTime.value(
            1
        ))
    }
}
