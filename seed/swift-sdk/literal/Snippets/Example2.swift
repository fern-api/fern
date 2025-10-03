import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

    try await client.inlined.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        context: .youreSuperWise,
        query: "What is the weather today",
        temperature: 10.1,
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
