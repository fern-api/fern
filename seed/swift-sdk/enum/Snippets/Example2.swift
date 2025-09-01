import Enum

let client = SeedEnumClient()

private func main() async throws {
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
}

try await main()
