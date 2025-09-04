import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

    try await client.reference.send(request: SendRequest(
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
    ))
}

try await main()
