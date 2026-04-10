import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.reference.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: true,
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
