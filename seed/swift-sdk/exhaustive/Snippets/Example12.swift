import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    try await client.endpoints.httpMethods.testPut(
        id: "id",
        request: ObjectWithRequiredField(
            string: "string"
        )
    )
}

try await main()
