import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.updatetestsubmissionstatus(
        submissionId: "submissionId",
        request: .init(body: TestSubmissionStatus.stopped(
            TestSubmissionStatusStopped(

            )
        ))
    )
}

try await main()
