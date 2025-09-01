import Enum

let client = SeedEnumClient()

try await client.pathParam.send(
    operand: .greaterThan,
    operandOrColor: ColorOrOperand.color(
        .red
    )
)
