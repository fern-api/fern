import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.streamXFernStreamingUnionStream(request: StreamXFernStreamingUnionStreamRequest.message(
        UnionStreamMessageVariant(
            streamResponse: true,
            prompt: "prompt",
            message: "message"
        )
    ))
}

try await main()
