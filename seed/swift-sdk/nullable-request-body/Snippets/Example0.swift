import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.testGroup.testMethodName(
        pathParam: "path_param",
        request: .value(PlainObject(

        ))
    )
}

try await main()
