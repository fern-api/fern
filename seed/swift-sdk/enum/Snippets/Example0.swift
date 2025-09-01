import Enum

let client = SeedEnumClient()

try await client.headers.send(
    request: .init(
        operand: .greaterThan,
        maybeOperand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        ),
        maybeOperandOrColor: ColorOrOperand.color(

        )
    )
)
