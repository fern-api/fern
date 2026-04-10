import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.storetracedworkspacev2(
        submissionId: "submissionId",
        request: .init(body: [
            TraceResponseV2(
                submissionId: "submissionId",
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
                stack: StackInformation(
                    numStackFrames: 1
                )
            )
        ])
    )
}

try await main()
