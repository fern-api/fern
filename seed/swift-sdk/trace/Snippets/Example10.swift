import Trace

let client = SeedTraceClient(token: "<token>")

try await client.homepage.setHomepageProblems(
    request: [
        "string",
        "string"
    ]
)
