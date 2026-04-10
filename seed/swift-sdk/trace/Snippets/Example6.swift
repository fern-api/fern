import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.updateworkspacesubmissionstatus(
        submissionId: "submissionId",
        request: .init(body: WorkspaceSubmissionStatus.workspaceSubmissionStatusZero(
            WorkspaceSubmissionStatusZero(
                type: .stopped
            )
        ))
    )
}

try await main()
