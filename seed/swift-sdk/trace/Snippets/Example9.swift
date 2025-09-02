import Foundation
import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.homepage.getHomepageProblems()
}

try await main()
