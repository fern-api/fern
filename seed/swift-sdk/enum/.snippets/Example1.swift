import Foundation
import Enum

private func main() async throws {
    let client = EnumClient(baseURL: "https://api.fern.com")

    _ = try await client.inlinedRequest.send(request: .init(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
    ))
}

try await main()
