import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.unknown.postobject(request: .init(unknown: .object([
        "key": .string("value")
    ])))
}

try await main()
