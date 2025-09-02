import Foundation
import Enum

private func main() async throws {
    let client = SeedEnumClient()

    try await client.inlinedRequest.send(request: .init(
        operand: .greaterThan,
        maybeOperand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        ),
        maybeOperandOrColor: ColorOrOperand.color(
            .red
        )
    ))
}

try await main()
