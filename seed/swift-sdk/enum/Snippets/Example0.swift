import Enum

let client = SeedEnumClient()

private func main() async throws {
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
}

try await main()
