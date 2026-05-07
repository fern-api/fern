import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnNestedWithRequiredField(
        string: "string",
        request: .init(body: TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(

            )
        ))
    )
}

try await main()
