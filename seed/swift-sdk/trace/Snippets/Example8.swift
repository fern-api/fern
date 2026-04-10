import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.sendworkspacesubmissionupdate(
        submissionId: "submissionId",
        request: .init(body: WorkspaceSubmissionUpdate(
            updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updateInfo: WorkspaceSubmissionUpdateInfo.workspaceSubmissionUpdateInfoZero(
                WorkspaceSubmissionUpdateInfoZero(
                    type: .running
                )
            )
        ))
    )
}

try await main()
