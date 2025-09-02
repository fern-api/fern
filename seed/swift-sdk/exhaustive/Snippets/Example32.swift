import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    try await client.endpoints.primitive.getAndReturnDouble(request: 1.1)
}

try await main()
