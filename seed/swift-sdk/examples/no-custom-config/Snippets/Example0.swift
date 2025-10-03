import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.echo(request: "Hello world!\n\nwith\n\tnewlines")
}

try await main()
