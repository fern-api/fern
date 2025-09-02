import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient()

    try await client.query.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        optionalPrompt: .youAreAHelpfulAssistant,
        aliasPrompt: .youAreAHelpfulAssistant,
        aliasOptionalPrompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: ,
        optionalStream: ,
        aliasStream: ,
        aliasOptionalStream: 
    ))
}

try await main()
