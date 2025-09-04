import Foundation
import PlainText

private func main() async throws {
    let client = PlainTextClient(baseURL: "https://api.fern.com")

    try await client.service.getText()
}

try await main()
