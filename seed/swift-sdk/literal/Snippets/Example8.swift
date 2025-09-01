import Literal

private func main() async throws {
    let client = SeedLiteralClient()

    try await client.reference.send(request: SendRequest(
        prompt: .youAreAHelpfulAssistant,
        stream: ,
        context: .youreSuperWise,
        query: "What is the weather today",
        containerObject: ContainerObject(
            nestedObjects: [
                NestedObjectWithLiterals(
                    literal1: .literal1,
                    literal2: .literal2,
                    strProp: "strProp"
                )
            ]
        )
    ))
}

try await main()
