import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.union.testCamelCaseProperties(request: .init(paymentMethod: PaymentMethodUnion.tokenizeCard(
        TokenizeCard(
            method: "card",
            cardNumber: "1234567890123456"
        )
    )))
}

try await main()
