import Foundation

public enum V2TestCaseFunction: Codable, Hashable, Sendable {
    case v2TestCaseFunctionOne(V2TestCaseFunctionOne)
    case v2TestCaseFunctionZero(V2TestCaseFunctionZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2TestCaseFunctionOne.self) {
            self = .v2TestCaseFunctionOne(value)
        } else if let value = try? container.decode(V2TestCaseFunctionZero.self) {
            self = .v2TestCaseFunctionZero(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .v2TestCaseFunctionOne(let value):
            try container.encode(value)
        case .v2TestCaseFunctionZero(let value):
            try container.encode(value)
        }
    }
}