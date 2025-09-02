import Foundation
import Literal

private func main() async throws {
    let client = SeedLiteralClient()

    try await client.inlined.send(request: .init(
        temperature: 10.1,
        prompt: .youAreAHelpfulAssistant,
        context: .youreSuperWise,
        aliasedContext: .youreSuperWise,
        maybeContext: .youreSuperWise,
        objectWithLiteral: ATopLevelLiteral(
            nestedLiteral: ANestedLiteral(
                myLiteral: .howSuperCool
            )
        ),
        stream: ,
        query: "What is the weather today"
    ))
}

try await main()
