import Foundation
import Trace

enum Example13 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.playlist.getPlaylists(
            serviceParam: "1",
            limit: 1,
            otherField: "otherField",
            multiLineDocs: "multiLineDocs"
        )
    }
}
