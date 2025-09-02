import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    try await client.foo()
}

try await main()
