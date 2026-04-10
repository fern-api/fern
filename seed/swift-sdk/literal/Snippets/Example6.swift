import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.query.send(
        prompt: .youAreAHelpfulAssistant,
        aliasPrompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: true,
        aliasStream: true
    )
}

try await main()
