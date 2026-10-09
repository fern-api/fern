import Foundation
import Api

enum Example0 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.createAst(request: AstNode.llm(
            AstNodeLlm(
                model: "model"
            )
        ))
    }
}
