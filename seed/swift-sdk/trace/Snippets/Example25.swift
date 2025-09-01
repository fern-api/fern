import Trace

let client = SeedTraceClient(token: "<token>")

try await client.sysprop.setNumWarmInstances(
    language: .java,
    numWarmInstances: 1
)
