import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.query.send(
        prompt: .youAreAHelpfulAssistant,
        optionalPrompt: .value(.youAreAHelpfulAssistant),
        aliasPrompt: .youAreAHelpfulAssistant,
        aliasOptionalPrompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: true,
        optionalStream: .value(true),
        aliasStream: true,
        aliasOptionalStream: true
    )
}

try await main()
