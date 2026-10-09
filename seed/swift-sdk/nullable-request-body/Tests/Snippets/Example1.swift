import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.testGroup.testMethodName(
            pathParam: "path_param",
            queryParamObject: .value(PlainObject(
                id: "id",
                name: "name"
            )),
            queryParamInteger: .value(1),
            request: .value(PlainObject(
                id: "id",
                name: "name"
            ))
        )
    }
}
