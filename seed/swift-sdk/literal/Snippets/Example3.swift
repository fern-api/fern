import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.inlined.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        context: .value(.youreSuperWise),
        query: "query",
        temperature: .value(1.1),
        stream: true,
        aliasedContext: .youreSuperWise,
        maybeContext: .youreSuperWise,
        objectWithLiteral: ATopLevelLiteral(
            nestedLiteral: ANestedLiteral(
                myLiteral: .howSuperCool
            )
        )
    ))
}

try await main()
