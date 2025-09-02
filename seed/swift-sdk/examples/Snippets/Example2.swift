import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    try await client.echo(request: "primitive")
}

try await main()
