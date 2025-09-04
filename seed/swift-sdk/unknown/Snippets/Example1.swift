import Foundation
import UnknownAsAny

private func main() async throws {
    let client = UnknownAsAnyClient(baseURL: "https://api.fern.com")

    try await client.unknown.postObject(request: MyObject(
        unknown: .object([
            "key": .string("value")
        ])
    ))
}

try await main()
