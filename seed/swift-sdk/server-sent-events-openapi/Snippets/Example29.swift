import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.validateUnionRequest(request: UnionStreamRequestBase(
        streamResponse: true,
        prompt: "prompt"
    ))
}

try await main()
