import Foundation
import ContentTypes

private func main() async throws {
    let client = ContentTypesClient(baseURL: "https://api.fern.com")

    _ = try await client.service.optionalMergePatchTest(request: .init(
        requiredField: "requiredField",
        optionalString: "optionalString",
        optionalInteger: 1,
        optionalBoolean: true,
        nullableString: .value("nullableString")
    ))
}

try await main()
