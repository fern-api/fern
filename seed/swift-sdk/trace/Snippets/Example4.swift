import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.sendWorkspaceSubmissionUpdate(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        request: WorkspaceSubmissionUpdate(
            updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updateInfo: WorkspaceSubmissionUpdateInfo.running(
                .init(
                    running: 
                )
            )
        )
    )
}

try await main()
