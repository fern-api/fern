import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.streamXFernStreamingUnion(request: StreamXFernStreamingUnionRequest.message(
        UnionStreamMessageVariant(
            streamResponse: false,
            prompt: "prompt",
            message: "message"
        )
    ))
}

try await main()
