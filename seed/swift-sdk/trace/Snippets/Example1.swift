import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.admin.updateTestSubmissionStatus(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        request: TestSubmissionStatus.stopped(
            .init(

            )
        )
    )
}

try await main()
