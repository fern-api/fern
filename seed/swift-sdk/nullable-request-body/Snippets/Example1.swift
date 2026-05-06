import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.testgroup.testMethodName(
        pathParam: "path_param",
        queryParamObject: .value(PlainObject(
            id: .value("id"),
            name: .value("name")
        )),
        queryParamInteger: .value(1),
        request: .value(PlainObject(
            id: .value("id"),
            name: .value("name")
        ))
    )
}

try await main()
