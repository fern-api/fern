import Foundation
import PackageYml

enum Example1 {
    static func snippet() async throws {
        let client = PackageYmlClient(baseURL: "https://api.fern.com")

        _ = try await client.echo(
            id: "id",
            request: EchoRequest(
                name: "name",
                size: 1
            )
        )
    }
}
