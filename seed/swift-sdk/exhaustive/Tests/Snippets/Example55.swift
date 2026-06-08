import Foundation
import Exhaustive

enum Example55 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.union.getAndReturnUnion(request: Animal.dog(
            Dog(
                name: "name",
                likesToWoof: true
            )
        ))
    }
}
