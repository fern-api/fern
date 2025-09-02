import Foundation
import PlainText

private func main() async throws {
    let client = PlainTextClient()

    try await client.service.getText()
}

try await main()
