import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

    try await client.query.send(
        prompt: .youAreAHelpfulAssistant,
        optionalPrompt: .youAreAHelpfulAssistant,
        aliasPrompt: .youAreAHelpfulAssistant,
        aliasOptionalPrompt: .youAreAHelpfulAssistant,
        query: "What is the weather today",
        stream: ,
        optionalStream: ,
        aliasStream: ,
        aliasOptionalStream: 
    )
}

try await main()
