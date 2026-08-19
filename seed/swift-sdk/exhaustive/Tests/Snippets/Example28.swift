import Foundation
import Exhaustive

enum Example28 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.object.getAndReturnWithRequiredNestedObject(request: ObjectWithRequiredNestedObject(
            requiredString: "hello",
            requiredObject: NestedObjectWithRequiredField(
                string: "nested",
                nestedObject: ObjectWithOptionalField(

                )
            )
        ))
    }
}
