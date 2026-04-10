import Foundation
import Errors

private func main() async throws {
    let client = ErrorsClient(baseURL: "https://api.fern.com")

    _ = try await client.simple.fooWithExamples(request: FooRequest(
        bar: "hello"
    ))
}

try await main()
