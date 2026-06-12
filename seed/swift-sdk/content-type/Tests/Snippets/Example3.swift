import Foundation
import ContentTypes

enum Example3 {
    static func snippet() async throws {
        let client = ContentTypesClient(baseURL: "https://api.fern.com")

        _ = try await client.service.optionalMergePatchTest(request: .init(
            requiredField: "requiredField",
            optionalString: "optionalString",
            optionalInteger: 1,
            optionalBoolean: true,
            nullableString: .value("nullableString")
        ))
    }
}
