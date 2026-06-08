import Foundation
import Api

enum Example24 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamXFernStreamingUnionStream(request: StreamXFernStreamingUnionStreamRequest.message(
            UnionStreamMessageVariant(
                streamResponse: true,
                prompt: "prompt",
                message: "message"
            )
        ))
    }
}
