import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsHttpMethods.endpointsHttpMethodsTestPatch(
        id: "id",
        request: .init(body: TypesObjectWithOptionalField(

        ))
    )
}

try await main()
