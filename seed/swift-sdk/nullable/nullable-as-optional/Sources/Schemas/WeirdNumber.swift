import Foundation

public enum WeirdNumber: Codable, Hashable, Sendable {
    case int(Int)
    case nullableFloat(Nullable<Float>)
    case optionalNullableString(Nullable<String>?)
    case double(Double)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode(Nullable<Float>.self) {
            self = .nullableFloat(value)
        } else if let value = try? container.decode(Nullable<String>?.self) {
            self = .optionalNullableString(value)
        } else if let value = try? container.decode(Double.self) {
            self = .double(value)
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
        case .int(let value):
            try container.encode(value)
        case .nullableFloat(let value):
            try container.encode(value)
        case .optionalNullableString(let value):
            try container.encode(value)
        case .double(let value):
            try container.encode(value)
        }
    }
}