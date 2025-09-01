import ApiWideBasePath

let client = SeedApiWideBasePathClient()

try await client.service.post(
    pathParam: "pathParam",
    serviceParam: "serviceParam",
    resourceParam: "resourceParam",
    endpointParam: 1
)
