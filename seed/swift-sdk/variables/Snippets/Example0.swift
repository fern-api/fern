import Variables

let client = SeedVariablesClient()

try await client.service.post(
    endpointParam: "endpointParam"
)
