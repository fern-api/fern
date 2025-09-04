import Foundation
import Errors

private func main() async throws {
    let client = ErrorsClient()

    try await client.simple.foo(request: FooRequest(
        bar: "bar"
    ))
}

try await main()
