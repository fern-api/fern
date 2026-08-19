import Foundation
import PackageYml

enum Example0 {
    static func snippet() async throws {
        let client = PackageYmlClient(baseURL: "https://api.fern.com")

        _ = try await client.echo(
            id: "id-ksfd9c1",
            request: EchoRequest(
                name: "Hello world!",
                size: 20
            )
        )
    }
}
