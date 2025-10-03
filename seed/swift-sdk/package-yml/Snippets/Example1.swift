import Foundation
import PackageYml

private func main() async throws {
    let client = PackageYmlClient(baseURL: "https://api.fern.com")

    _ = try await client.echo(
        id: "id",
        request: EchoRequest(
            name: "name",
            size: 1
        )
    )
}

try await main()
