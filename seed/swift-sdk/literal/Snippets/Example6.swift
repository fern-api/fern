import Literal

let client = SeedLiteralClient()

private func main() async throws {
    try await client.query.send(
        request: .init(
            prompt: .youAreAHelpfulAssistant,
            optionalPrompt: .youAreAHelpfulAssistant,
            aliasPrompt: .youAreAHelpfulAssistant,
            aliasOptionalPrompt: .youAreAHelpfulAssistant,
            stream: ,
            optionalStream: ,
            aliasStream: ,
            aliasOptionalStream: ,
            query: "What is the weather today"
        )
    )
}

try await main()
