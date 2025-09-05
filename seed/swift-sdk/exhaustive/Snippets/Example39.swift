import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.endpoints.union.getAndReturnUnion(request: Animal.dog(
        .init(
            name: "name",
            likesToWoof: True
        )
    ))
}

try await main()
