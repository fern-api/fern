import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    try await client.sysprop.setNumWarmInstances(
        language: .java,
        numWarmInstances: 1
    )
}

try await main()
