import Foundation
import Enum

private func main() async throws {
    let client = EnumClient(baseURL: "https://api.fern.com")

    try await client.queryParam.sendList(
        operand: ,
        maybeOperand: ,
        operandOrColor: ,
        maybeOperandOrColor: 
    )
}

try await main()
