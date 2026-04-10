import Foundation

public indirect enum DebugVariableValue: Codable, Hashable, Sendable {
    case binaryTreeNodeValue(BinaryTreeNodeAndTreeValue)
    case booleanValue(Bool)
    case charValue(String)
    case doubleValue(Double)
    case doublyLinkedListNodeValue(DoublyLinkedListNodeAndListValue)
    case genericValue(GenericValue)
    case integerValue(Int)
    case listValue([DebugVariableValue])
    case mapValue(DebugMapValue)
    case nullValue
    case singlyLinkedListNodeValue(SinglyLinkedListNodeAndListValue)
    case stringValue(String)
    case undefinedValue

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "binaryTreeNodeValue":
            self = .binaryTreeNodeValue(try BinaryTreeNodeAndTreeValue(from: decoder))
        case "booleanValue":
            self = .booleanValue(try container.decode(Bool.self, forKey: .value))
        case "charValue":
            self = .charValue(try container.decode(String.self, forKey: .value))
        case "doubleValue":
            self = .doubleValue(try container.decode(Double.self, forKey: .value))
        case "doublyLinkedListNodeValue":
            self = .doublyLinkedListNodeValue(try DoublyLinkedListNodeAndListValue(from: decoder))
        case "genericValue":
            self = .genericValue(try GenericValue(from: decoder))
        case "integerValue":
            self = .integerValue(try container.decode(Int.self, forKey: .value))
        case "listValue":
            self = .listValue(try container.decode([DebugVariableValue].self, forKey: .value))
        case "mapValue":
            self = .mapValue(try DebugMapValue(from: decoder))
        case "nullValue":
            self = .nullValue
        case "singlyLinkedListNodeValue":
            self = .singlyLinkedListNodeValue(try SinglyLinkedListNodeAndListValue(from: decoder))
        case "stringValue":
            self = .stringValue(try container.decode(String.self, forKey: .value))
        case "undefinedValue":
            self = .undefinedValue
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
        case .binaryTreeNodeValue(let data):
            try container.encode("binaryTreeNodeValue", forKey: .type)
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
        case .doublyLinkedListNodeValue(let data):
            try container.encode("doublyLinkedListNodeValue", forKey: .type)
            try data.encode(to: encoder)
        case .genericValue(let data):
            try container.encode("genericValue", forKey: .type)
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
        case .singlyLinkedListNodeValue(let data):
            try container.encode("singlyLinkedListNodeValue", forKey: .type)
            try data.encode(to: encoder)
        case .stringValue(let data):
            try container.encode("stringValue", forKey: .type)
            try container.encode(data, forKey: .value)
        case .undefinedValue:
            try container.encode("undefinedValue", forKey: .type)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}