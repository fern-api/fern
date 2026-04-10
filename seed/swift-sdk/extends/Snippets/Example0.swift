import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client..extendedInlineRequestBody(request: .init(
        name: "name",
        docs: "docs",
        unique: "unique"
    ))
}

try await main()
