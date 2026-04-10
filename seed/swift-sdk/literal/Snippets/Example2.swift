import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.inlined.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: true,
        aliasedContext: .youreSuperWise,
        objectWithLiteral: ATopLevelLiteral(
            nestedLiteral: ANestedLiteral(
                myLiteral: .howSuperCool
            )
        )
    ))
}

try await main()
