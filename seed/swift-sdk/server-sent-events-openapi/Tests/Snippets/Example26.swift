import Foundation
import Api

enum Example26 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamXFernStreamingUnion(request: StreamXFernStreamingUnionRequest.message(
            UnionStreamMessageVariant(
                streamResponse: false,
                prompt: "prompt",
                message: "message"
            )
        ))
    }
}
