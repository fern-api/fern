import Foundation

public enum CommonsEventInfo: Codable, Hashable, Sendable {
    case commonsEventInfoType(CommonsEventInfoType)
    case commonsEventInfoZero(CommonsEventInfoZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(CommonsEventInfoType.self) {
            self = .commonsEventInfoType(value)
        } else if let value = try? container.decode(CommonsEventInfoZero.self) {
            self = .commonsEventInfoZero(value)
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
        case .commonsEventInfoType(let value):
            try container.encode(value)
        case .commonsEventInfoZero(let value):
            try container.encode(value)
        }
    }
}