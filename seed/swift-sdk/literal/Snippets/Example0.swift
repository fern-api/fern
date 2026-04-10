import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.headers.send(request: .init(query: "query"))
}

try await main()
