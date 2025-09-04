import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

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
