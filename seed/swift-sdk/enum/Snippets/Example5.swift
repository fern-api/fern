import Enum

let client = SeedEnumClient()

try await client.queryParam.send(
    request: .init(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    )
)
