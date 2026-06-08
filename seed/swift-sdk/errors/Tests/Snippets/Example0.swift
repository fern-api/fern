import Foundation
import Errors

enum Example0 {
    static func snippet() async throws {
        let client = ErrorsClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.fooWithoutEndpointError(request: FooRequest(
            bar: "bar"
        ))
    }
}
