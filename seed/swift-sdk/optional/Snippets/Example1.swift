import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.optional.sendoptionalbody(request: .value([
        "string": .object([
            "key": .string("value")
        ])
    ]))
}

try await main()
