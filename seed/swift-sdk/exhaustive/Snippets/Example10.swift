import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    try await client.endpoints.httpMethods.testGet(id: "id")
}

try await main()
