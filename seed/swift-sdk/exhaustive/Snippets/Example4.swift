import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.container.getAndReturnSetOfObjects(request: .array([.object(["string": .string("string")])]))
}

try await main()
