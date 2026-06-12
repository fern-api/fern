import Foundation
import Literal

enum Example7 {
    static func snippet() async throws {
        let client = LiteralClient(baseURL: "https://api.fern.com")

        _ = try await client.query.send(
            prompt: .youAreAHelpfulAssistant,
            optionalPrompt: .youAreAHelpfulAssistant,
            aliasPrompt: .youAreAHelpfulAssistant,
            aliasOptionalPrompt: .youAreAHelpfulAssistant,
            query: "query",
            stream: false,
            optionalStream: false,
            aliasStream: false,
            aliasOptionalStream: false
        )
    }
}
