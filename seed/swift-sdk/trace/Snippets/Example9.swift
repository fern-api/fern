import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    try await client.homepage.getHomepageProblems()
}

try await main()
