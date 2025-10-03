import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient(baseURL: "https://api.fern.com")

    _ = try await client.nullable.deleteUser(request: .init(username: .value("xy")))
}

try await main()
