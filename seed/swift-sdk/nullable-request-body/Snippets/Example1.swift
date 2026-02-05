import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.testGroup.testMethodName(
        pathParam: "path_param",
        queryParamObject: .value(PlainObject(
            id: "id",
            name: "name"
        )),
        queryParamInteger: .value(1),
        request: .init(body: .value(PlainObject(
            id: "id",
            name: "name"
        )))
    )
}

try await main()
