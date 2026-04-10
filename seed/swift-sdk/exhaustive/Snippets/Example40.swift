import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredField(
        string: "string",
        request: .init(body: TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(

            )
        ))
    )
}

try await main()
