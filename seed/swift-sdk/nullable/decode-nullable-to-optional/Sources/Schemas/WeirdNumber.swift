import Foundation

public enum WeirdNumber: Codable, Hashable, Sendable {
    case double(Double)
    case int(Int)
    case optionalFloat(Float?)
    case optionalString(String?)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Double.self) {
            self = .double(value)
        } else if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode(Float?.self) {
            self = .optionalFloat(value)
        } else if let value = try? container.decode(String?.self) {
            self = .optionalString(value)
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
        case .double(let value):
            try container.encode(value)
        case .int(let value):
            try container.encode(value)
        case .optionalFloat(let value):
            try container.encode(value)
        case .optionalString(let value):
            try container.encode(value)
        }
    }
}