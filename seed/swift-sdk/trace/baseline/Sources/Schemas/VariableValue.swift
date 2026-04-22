import Foundation

public indirect enum VariableValue: Codable, Hashable, Sendable {
    case binaryTreeValue(BinaryTreeValue)
    case booleanValue(Bool)
    case charValue(String)
    case doubleValue(Double)
    case doublyLinkedListValue(DoublyLinkedListValue)
    case integerValue(Int)
    case listValue([VariableValue])
    case mapValue(MapValue)
    case nullValue
    case singlyLinkedListValue(SinglyLinkedListValue)
    case stringValue(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "binaryTreeValue":
            self = .binaryTreeValue(try BinaryTreeValue(from: decoder))
        case "booleanValue":
            self = .booleanValue(try container.decode(Bool.self, forKey: .value))
        case "charValue":
            self = .charValue(try container.decode(String.self, forKey: .value))
        case "doubleValue":
            self = .doubleValue(try container.decode(Double.self, forKey: .value))
        case "doublyLinkedListValue":
            self = .doublyLinkedListValue(try DoublyLinkedListValue(from: decoder))
        case "integerValue":
            self = .integerValue(try container.decode(Int.self, forKey: .value))
        case "listValue":
            self = .listValue(try container.decode([VariableValue].self, forKey: .value))
        case "mapValue":
            self = .mapValue(try MapValue(from: decoder))
        case "nullValue":
            self = .nullValue
        case "singlyLinkedListValue":
            self = .singlyLinkedListValue(try SinglyLinkedListValue(from: decoder))
        case "stringValue":
            self = .stringValue(try container.decode(String.self, forKey: .value))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .binaryTreeValue(let data):
            try container.encode("binaryTreeValue", forKey: .type)
            try data.encode(to: encoder)
        case .booleanValue(let data):
            try container.encode("booleanValue", forKey: .type)
            try container.encode(data, forKey: .value)
        case .charValue(let data):
            try container.encode("charValue", forKey: .type)
            try container.encode(data, forKey: .value)
        case .doubleValue(let data):
            try container.encode("doubleValue", forKey: .type)
            try container.encode(data, forKey: .value)
        case .doublyLinkedListValue(let data):
            try container.encode("doublyLinkedListValue", forKey: .type)
            try data.encode(to: encoder)
        case .integerValue(let data):
            try container.encode("integerValue", forKey: .type)
            try container.encode(data, forKey: .value)
        case .listValue(let data):
            try container.encode("listValue", forKey: .type)
            try container.encode(data, forKey: .value)
        case .mapValue(let data):
            try container.encode("mapValue", forKey: .type)
            try data.encode(to: encoder)
        case .nullValue:
            try container.encode("nullValue", forKey: .type)
        case .singlyLinkedListValue(let data):
            try container.encode("singlyLinkedListValue", forKey: .type)
            try data.encode(to: encoder)
        case .stringValue(let data):
            try container.encode("stringValue", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}