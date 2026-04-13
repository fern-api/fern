import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.payment.create(request: .init(
        amount: 1,
        currency: .usd
    ))
}

try await main()
