import Foundation
import Errors

private func main() async throws {
    let client = ErrorsClient()

    try await client.simple.fooWithExamples(request: FooRequest(
        bar: "hello"
    ))
}

try await main()
