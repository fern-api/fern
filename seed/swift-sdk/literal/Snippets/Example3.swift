import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

    _ = try await client.inlined.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        context: .youreSuperWise,
        query: "query",
        temperature: 1.1,
        stream: ,
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
