import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.getFoo(
        optionalBaz: "optional_baz",
        optionalNullableBaz: .value("optional_nullable_baz"),
        requiredBaz: "required_baz",
        requiredNullableBaz: .value("required_nullable_baz")
    )
}

try await main()
