import Literal

let client = SeedLiteralClient()

private func main() async throws {
    try await client.reference.send(
        request: SendRequest(
            prompt: .youAreAHelpfulAssistant,
            query: "query",
            stream: ,
            ending: .ending,
            context: .youreSuperWise,
            maybeContext: .youreSuperWise,
            containerObject: ContainerObject(
                nestedObjects: [
                    NestedObjectWithLiterals(
                        literal1: .literal1,
                        literal2: .literal2,
                        strProp: "strProp"
                    ),
                    NestedObjectWithLiterals(
                        literal1: .literal1,
                        literal2: .literal2,
                        strProp: "strProp"
                    )
                ]
            )
        )
    )
}

try await main()
