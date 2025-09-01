import Literal

let client = SeedLiteralClient()

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
