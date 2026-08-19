import Foundation
import Trace

enum Example23 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.problem.getDefaultStarterFiles(request: .init(
            inputParams: [
                VariableTypeAndName(
                    variableType: VariableType.integerType,
                    name: "name"
                ),
                VariableTypeAndName(
                    variableType: VariableType.integerType,
                    name: "name"
                )
            ],
            outputType: VariableType.integerType,
            methodName: "methodName"
        ))
    }
}
