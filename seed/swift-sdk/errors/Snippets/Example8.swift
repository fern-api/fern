import Foundation
import Errors

private func main() async throws {
    let client = ErrorsClient(baseURL: "https://api.fern.com")

    try await client.simple.foo(request: FooRequest(
        bar: "bar"
    ))
}

try await main()
