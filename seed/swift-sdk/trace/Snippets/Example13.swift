import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.playlist.getPlaylists(
        serviceParam: 1,
        request: .init(
            serviceParam: 1,
            limit: 1,
            otherField: "otherField",
            multiLineDocs: "multiLineDocs",
            optionalMultipleField: [
                "optionalMultipleField"
            ],
            multipleField: [
                "multipleField"
            ]
        )
    )
}

try await main()
