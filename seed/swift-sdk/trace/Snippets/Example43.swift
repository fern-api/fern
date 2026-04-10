import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.problem.getdefaultstarterfiles(request: .init(
        inputParams: [
            VariableTypeAndName(
                variableType: VariableType.variableTypeZero(
                    VariableTypeZero(
                        type: .integerType
                    )
                ),
                name: "name"
            ),
            VariableTypeAndName(
                variableType: VariableType.variableTypeZero(
                    VariableTypeZero(
                        type: .integerType
                    )
                ),
                name: "name"
            )
        ],
        outputType: VariableType.variableTypeZero(
            VariableTypeZero(
                type: .integerType
            )
        ),
        methodName: "methodName"
    ))
}

try await main()
