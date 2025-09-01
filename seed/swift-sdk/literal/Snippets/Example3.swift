import Literal

let client = SeedLiteralClient()

private func main() async throws {
    try await client.inlined.send(
        request: .init(
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
        )
    )
}

try await main()
