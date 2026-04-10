import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredNestedObject(request: TypesObjectWithRequiredNestedObject(
        requiredString: "requiredString",
        requiredObject: TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(

            )
        )
    ))
}

try await main()
