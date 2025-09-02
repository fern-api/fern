import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    try await client.endpoints.primitive.getAndReturnDate(request: Date(timeIntervalSince1970: 1673740800))
}

try await main()
