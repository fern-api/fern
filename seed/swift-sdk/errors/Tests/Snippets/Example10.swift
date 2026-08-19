import Foundation
import Errors

enum Example10 {
    static func snippet() async throws {
        let client = ErrorsClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.fooWithExamples(request: FooRequest(
            bar: "hello"
        ))
    }
}
