import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(request: TypesObjectWithMixedRequiredAndOptionalFields(
        requiredString: "requiredString",
        requiredInteger: 1,
        optionalString: .value("optionalString"),
        requiredLong: 1000000
    ))
}

try await main()
