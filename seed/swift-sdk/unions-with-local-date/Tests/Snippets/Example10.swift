import Foundation
import Unions

enum Example10 {
    static func snippet() async throws {
        let client = UnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.update(request: Shape.circle(
            Circle(
                radius: 1.1
            )
        ))
    }
}
