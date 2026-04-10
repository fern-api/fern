import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsParams.endpointsParamsModifyWithPath(
        param: "param",
        request: .init(body: "string")
    )
}

try await main()
