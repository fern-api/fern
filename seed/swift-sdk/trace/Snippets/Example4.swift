import Trace

let client = SeedTraceClient(token: "<token>")

try await client.admin.sendWorkspaceSubmissionUpdate(
    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    request: WorkspaceSubmissionUpdate(
        updateTime: Date(timeIntervalSince1970: 1705311000),
        updateInfo: WorkspaceSubmissionUpdateInfo.running(
            .init(
                running: 
            )
        )
    )
)
