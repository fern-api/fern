import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.createuser(request: .init(
        email: "email",
        connection: "connection"
    ))
}

try await main()
