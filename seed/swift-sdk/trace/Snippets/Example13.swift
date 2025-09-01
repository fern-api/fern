import Trace

let client = SeedTraceClient(token: "<token>")

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
