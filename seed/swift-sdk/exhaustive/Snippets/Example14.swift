import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.endpoints.httpMethods.testDelete(id: "id")
}

try await main()
