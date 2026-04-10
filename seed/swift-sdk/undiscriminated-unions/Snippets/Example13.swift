import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.union.testcamelcaseproperties(request: .init(paymentMethod: PaymentMethodUnion.tokenizeCard(
        TokenizeCard(
            method: "method",
            cardNumber: "cardNumber"
        )
    )))
}

try await main()
