import Foundation

public enum ActualResult: Codable, Hashable, Sendable {
    case actualResultOne(ActualResultOne)
    case actualResultTwo(ActualResultTwo)
    case actualResultZero(ActualResultZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(ActualResultOne.self) {
            self = .actualResultOne(value)
        } else if let value = try? container.decode(ActualResultTwo.self) {
            self = .actualResultTwo(value)
        } else if let value = try? container.decode(ActualResultZero.self) {
            self = .actualResultZero(value)
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
        case .actualResultOne(let value):
            try container.encode(value)
        case .actualResultTwo(let value):
            try container.encode(value)
        case .actualResultZero(let value):
            try container.encode(value)
        }
    }
}