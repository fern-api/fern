import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.sysprop.getNumWarmInstances()
}

try await main()
