import Foundation
import Api

enum Example0 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.testGroup.testMethodName(
            pathParam: "path_param",
            request: .value(PlainObject(

            ))
        )
    }
}
