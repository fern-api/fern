import Foundation
import Trace

enum Example3 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.admin.updateWorkspaceSubmissionStatus(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            request: WorkspaceSubmissionStatus.stopped
        )
    }
}
