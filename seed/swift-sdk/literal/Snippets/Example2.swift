import Literal

let client = SeedLiteralClient()

private func main() async throws {
    try await client.inlined.send(
        request: .init(
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
        )
    )
}

try await main()
