import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.storetracedworkspace(
        submissionId: "submissionId",
        request: .init(
            workspaceRunDetails: WorkspaceRunDetails(
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
