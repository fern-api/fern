import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

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
