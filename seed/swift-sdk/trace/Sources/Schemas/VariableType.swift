import Foundation

public indirect enum VariableType: Codable, Hashable, Sendable {
    case binaryTreeType(BinaryTreeType)
    case booleanType(BooleanType)
    case charType(CharType)
    case doubleType(DoubleType)
    case doublyLinkedListType(DoublyLinkedListType)
    case integerType(IntegerType)
    case listType(ListType)
    case mapType(MapType)
    case singlyLinkedListType(SinglyLinkedListType)
    case stringType(StringType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "binaryTreeType":
            self = .binaryTreeType(try BinaryTreeType(from: decoder))
        case "booleanType":
            self = .booleanType(try BooleanType(from: decoder))
        case "charType":
            self = .charType(try CharType(from: decoder))
        case "doubleType":
            self = .doubleType(try DoubleType(from: decoder))
        case "doublyLinkedListType":
            self = .doublyLinkedListType(try DoublyLinkedListType(from: decoder))
        case "integerType":
            self = .integerType(try IntegerType(from: decoder))
        case "listType":
            self = .listType(try ListType(from: decoder))
        case "mapType":
            self = .mapType(try MapType(from: decoder))
        case "singlyLinkedListType":
            self = .singlyLinkedListType(try SinglyLinkedListType(from: decoder))
        case "stringType":
            self = .stringType(try StringType(from: decoder))
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
        switch self {
        case .binaryTreeType(let data):
            try data.encode(to: encoder)
        case .booleanType(let data):
            try data.encode(to: encoder)
        case .charType(let data):
            try data.encode(to: encoder)
        case .doubleType(let data):
            try data.encode(to: encoder)
        case .doublyLinkedListType(let data):
            try data.encode(to: encoder)
        case .integerType(let data):
            try data.encode(to: encoder)
        case .listType(let data):
            try data.encode(to: encoder)
        case .mapType(let data):
            try data.encode(to: encoder)
        case .singlyLinkedListType(let data):
            try data.encode(to: encoder)
        case .stringType(let data):
            try data.encode(to: encoder)
        }
    }

    public struct IntegerType: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct DoubleType: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct BooleanType: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct StringType: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct CharType: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct ListType: Codable, Hashable, Sendable {
        public let type: String = "listType"
        public let valueType: VariableType
        /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
        public let isFixedLength: Bool?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            valueType: VariableType,
            isFixedLength: Bool? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.valueType = valueType
            self.isFixedLength = isFixedLength
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.valueType = try container.decode(VariableType.self, forKey: .valueType)
            self.isFixedLength = try container.decodeIfPresent(Bool.self, forKey: .isFixedLength)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.valueType, forKey: .valueType)
            try container.encodeIfPresent(self.isFixedLength, forKey: .isFixedLength)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case valueType
            case isFixedLength
        }
    }

    public struct MapType: Codable, Hashable, Sendable {
        public let type: String = "mapType"
        public let keyType: VariableType
        public let valueType: VariableType
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            keyType: VariableType,
            valueType: VariableType,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.keyType = keyType
            self.valueType = valueType
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.keyType = try container.decode(VariableType.self, forKey: .keyType)
            self.valueType = try container.decode(VariableType.self, forKey: .valueType)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.keyType, forKey: .keyType)
            try container.encode(self.valueType, forKey: .valueType)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case keyType
            case valueType
        }
    }

    public struct BinaryTreeType: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct SinglyLinkedListType: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct DoublyLinkedListType: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}