import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    try await client.sysprop.getNumWarmInstances()
}

try await main()
