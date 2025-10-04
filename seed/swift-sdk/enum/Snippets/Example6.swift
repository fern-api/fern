import Foundation
import Enum

private func main() async throws {
    let client = EnumClient(baseURL: "https://api.fern.com")

    _ = try await client.queryParam.send(
        operand: .greaterThan,
        maybeOperand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        ),
        maybeOperandOrColor: ColorOrOperand.color(
            .red
        )
    )
}

try await main()
