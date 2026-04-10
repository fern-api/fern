import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.queryparam.send(
        operand: .greaterThan,
        maybeOperand: .greaterThan,
        operandOrColor: .red,
        maybeOperandOrColor: ColorOrOperand.color(
            .red
        )
    )
}

try await main()
