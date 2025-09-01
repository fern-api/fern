import Enum

let client = SeedEnumClient()

try await client.inlinedRequest.send(
    request: .init(
        operand: .greaterThan,
        maybeOperand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        ),
        maybeOperandOrColor: ColorOrOperand.color(
            .red
        )
    )
)
