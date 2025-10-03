import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    try await client.getFoo(request: .init(
        requiredBaz: "required_baz",
        requiredNullableBaz: "required_nullable_baz"
    ))
}

try await main()
