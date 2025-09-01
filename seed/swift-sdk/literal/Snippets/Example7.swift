import Literal

let client = SeedLiteralClient()

try await client.query.send(
    request: .init(
        prompt: .youAreAHelpfulAssistant,
        optionalPrompt: .youAreAHelpfulAssistant,
        aliasPrompt: .youAreAHelpfulAssistant,
        aliasOptionalPrompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: ,
        optionalStream: ,
        aliasStream: ,
        aliasOptionalStream: 
    )
)
