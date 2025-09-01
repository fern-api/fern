import ApiWideBasePath

let client = SeedApiWideBasePathClient()

private func main() async throws {
    try await client.service.post(
        pathParam: "pathParam",
        serviceParam: "serviceParam",
        resourceParam: "resourceParam",
        endpointParam: 1
    )
}

try await main()
