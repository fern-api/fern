import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.v2V3Problem.v2V3ProblemGetProblemVersion(
        problemId: "problemId",
        problemVersion: 1
    )
}

try await main()
