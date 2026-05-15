import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.sysprop.setNumWarmInstances(
        language: "JAVA",
        numWarmInstances: "1"
    )
}

try await main()
