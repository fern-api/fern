import Foundation
import Unions

enum Example7 {
    static func snippet() async throws {
        let client = UnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.types.update(request: UnionWithTime.datetime(

        ))
    }
}
