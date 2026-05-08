import Foundation
import UnknownAsAny

private func main() async throws {
    let client = UnknownAsAnyClient(baseURL: "https://api.fern.com")

    _ = try await client.unknown.postObject(request: MyObject(
        unknown: .object([
            "key": .string("value")
        ])
    ))
}

try await main()
