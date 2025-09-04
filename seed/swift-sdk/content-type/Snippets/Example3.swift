import Foundation
import ContentTypes

private func main() async throws {
    let client = ContentTypesClient(baseURL: "https://api.fern.com")

    try await client.service.optionalMergePatchTest(request: .init(
        requiredField: "requiredField",
        optionalString: "optionalString",
        optionalInteger: 1,
        optionalBoolean: True,
        nullableString: "nullableString"
    ))
}

try await main()
