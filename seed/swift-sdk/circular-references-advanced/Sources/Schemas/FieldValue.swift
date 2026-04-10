import Foundation

public indirect enum FieldValue: Codable, Hashable, Sendable {
    case fieldValueOne(FieldValueOne)
    case fieldValueTwo(FieldValueTwo)
    case fieldValueZero(FieldValueZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(FieldValueOne.self) {
            self = .fieldValueOne(value)
        } else if let value = try? container.decode(FieldValueTwo.self) {
            self = .fieldValueTwo(value)
        } else if let value = try? container.decode(FieldValueZero.self) {
            self = .fieldValueZero(value)
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
        case .fieldValueOne(let value):
            try container.encode(value)
        case .fieldValueTwo(let value):
            try container.encode(value)
        case .fieldValueZero(let value):
            try container.encode(value)
        }
    }
}