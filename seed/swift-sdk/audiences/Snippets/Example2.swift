import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.foo.find(
        optionalString: .value(.value("optionalString")),
        request: .init(
            publicProperty: .value("publicProperty"),
            privateProperty: .value(1)
        )
    )
}

try await main()
