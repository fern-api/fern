import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.storetracedtestcase(
        submissionId: "submissionId",
        testCaseId: "testCaseId",
        request: .init(
            result: TestCaseResultWithStdout(
                result: TestCaseResult(
                    expectedResult: VariableValue.variableValueZero(
                        VariableValueZero(
                            type: .integerValue
                        )
                    ),
                    actualResult: ActualResult.actualResultZero(
                        ActualResultZero(
                            type: .value
                        )
                    ),
                    passed: true
                ),
                stdout: "stdout"
            ),
            traceResponses: [
                TraceResponse(
                    submissionId: "submissionId",
                    lineNumber: 1,
                    stack: StackInformation(
                        numStackFrames: 1
                    )
                )
            ]
        )
    )
}

try await main()
