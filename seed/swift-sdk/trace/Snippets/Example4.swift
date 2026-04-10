import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.sendtestsubmissionupdate(
        submissionId: "submissionId",
        request: .init(body: TestSubmissionUpdate(
            updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updateInfo: TestSubmissionUpdateInfo.testSubmissionUpdateInfoZero(
                TestSubmissionUpdateInfoZero(
                    type: .running
                )
            )
        ))
    )
}

try await main()
