import Foundation
import Enum

private func main() async throws {
    let client = EnumClient()

    try await client.headers.send(request: .init(
        operand: .greaterThan,
        maybeOperand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        ),
        maybeOperandOrColor: ColorOrOperand.color(

        )
    ))
}

try await main()
