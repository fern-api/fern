import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.v2.test(

    )
}

try await main()
