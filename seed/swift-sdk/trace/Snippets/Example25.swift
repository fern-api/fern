import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.sysprop.setNumWarmInstances(
        language: .java,
        numWarmInstances: 1
    )
}

try await main()
