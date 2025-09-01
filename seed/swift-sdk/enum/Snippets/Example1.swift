import Enum

let client = SeedEnumClient()

try await client.inlinedRequest.send(
    request: .init(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    )
)
