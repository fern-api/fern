import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.homepage.setHomepageProblems(request: [
        "string",
        "string"
    ])
}

try await main()
