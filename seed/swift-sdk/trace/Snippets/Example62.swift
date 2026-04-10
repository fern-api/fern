import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.v2Problem.v2ProblemGetProblemVersion(
        problemId: "problemId",
        problemVersion: 1
    )
}

try await main()
