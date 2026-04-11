import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.streamXFernStreamingConditionStream(request: .init(
        query: "query",
        stream: true
    ))
}

try await main()
