import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.admin.sendTestSubmissionUpdate(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        request: TestSubmissionUpdate(
            updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updateInfo: TestSubmissionUpdateInfo.running(
                .init(
                    running: 
                )
            )
        )
    )
}

try await main()
