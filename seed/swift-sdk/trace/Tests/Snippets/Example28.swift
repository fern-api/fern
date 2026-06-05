import Foundation
import Trace

enum Example28 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.sysprop.setNumWarmInstances(
            language: .java,
            numWarmInstances: 1
        )
    }
}
