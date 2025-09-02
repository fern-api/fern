import Foundation
import PackageYml

private func main() async throws {
    let client = PackageYmlClient()

    try await client.echo(
        id: "id-ksfd9c1",
        request: EchoRequest(
            name: "Hello world!",
            size: 20
        )
    )
}

try await main()
