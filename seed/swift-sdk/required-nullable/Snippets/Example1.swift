import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    try await client.getFoo(request: .init(
        optionalBaz: "optional_baz",
        optionalNullableBaz: "optional_nullable_baz",
        requiredBaz: "required_baz",
        requiredNullableBaz: "required_nullable_baz"
    ))
}

try await main()
