import Foundation
import Literal

enum Example9 {
    static func snippet() async throws {
        let client = LiteralClient(baseURL: "https://api.fern.com")

        _ = try await client.reference.send(request: SendRequest(
            prompt: .youAreAHelpfulAssistant,
            query: "query",
            stream: false,
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
}
