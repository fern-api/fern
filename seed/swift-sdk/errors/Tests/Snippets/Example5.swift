import Foundation
import Errors

enum Example5 {
    static func snippet() async throws {
        let client = ErrorsClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.foo(request: FooRequest(
            bar: "bar"
        ))
    }
}
