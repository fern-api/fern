import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.problem.getDefaultStarterFiles(
        request: .init(
            inputParams: [
                VariableTypeAndName(
                    variableType: VariableType.integerType(
                        .init(

                        )
                    ),
                    name: "name"
                ),
                VariableTypeAndName(
                    variableType: VariableType.integerType(
                        .init(

                        )
                    ),
                    name: "name"
                )
            ],
            outputType: VariableType.integerType(
                .init(

                )
            ),
            methodName: "methodName"
        )
    )
}

try await main()
