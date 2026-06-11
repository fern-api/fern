import Foundation
import Literal

enum Example8 {
    static func snippet() async throws {
        let client = LiteralClient(baseURL: "https://api.fern.com")

        _ = try await client.reference.send(request: SendRequest(
            prompt: .youAreAHelpfulAssistant,
            query: "What is the weather today",
            stream: false,
            context: .youreSuperWise,
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
}
