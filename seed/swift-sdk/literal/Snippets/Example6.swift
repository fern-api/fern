import Foundation
import Literal

private func main() async throws {
    let client = SeedLiteralClient()

    try await client.query.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        optionalPrompt: .youAreAHelpfulAssistant,
        aliasPrompt: .youAreAHelpfulAssistant,
        aliasOptionalPrompt: .youAreAHelpfulAssistant,
        stream: ,
        optionalStream: ,
        aliasStream: ,
        aliasOptionalStream: ,
        query: "What is the weather today"
    ))
}

try await main()
