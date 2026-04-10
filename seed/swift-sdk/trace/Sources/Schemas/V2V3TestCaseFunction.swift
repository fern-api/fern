import Foundation

public enum V2V3TestCaseFunction: Codable, Hashable, Sendable {
    case v2V3TestCaseFunctionOne(V2V3TestCaseFunctionOne)
    case v2V3TestCaseFunctionZero(V2V3TestCaseFunctionZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(V2V3TestCaseFunctionOne.self) {
            self = .v2V3TestCaseFunctionOne(value)
        } else if let value = try? container.decode(V2V3TestCaseFunctionZero.self) {
            self = .v2V3TestCaseFunctionZero(value)
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
        case .v2V3TestCaseFunctionOne(let value):
            try container.encode(value)
        case .v2V3TestCaseFunctionZero(let value):
            try container.encode(value)
        }
    }
}