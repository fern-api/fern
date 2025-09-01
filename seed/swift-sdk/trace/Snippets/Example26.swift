import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.sysprop.getNumWarmInstances(

    )
}

try await main()
