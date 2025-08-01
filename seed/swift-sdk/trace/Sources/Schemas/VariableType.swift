public enum VariableType: Codable, Hashable, Sendable {
    case integerType(IntegerType)
    case doubleType(DoubleType)
    case booleanType(BooleanType)
    case stringType(StringType)
    case charType(CharType)
    case listType(ListType)
    case mapType(MapType)
    case binaryTreeType(BinaryTreeType)
    case singlyLinkedListType(SinglyLinkedListType)
    case doublyLinkedListType(DoublyLinkedListType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
    }

    public struct IntegerType: Codable, Hashable, Sendable {
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
        public let isFixedLength: Bool?
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
            try container.encode(self.valueType, forKey: .valueType)
            try container.encodeIfPresent(self.isFixedLength, forKey: .isFixedLength)
        }

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
            try container.encode(self.keyType, forKey: .keyType)
            try container.encode(self.valueType, forKey: .valueType)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case keyType
            case valueType
        }
    }

    public struct BinaryTreeType: Codable, Hashable, Sendable {
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