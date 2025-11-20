import Foundation

public indirect enum VariableValue: Codable, Hashable, Sendable {
    case binaryTreeValue(BinaryTreeValue)
    case booleanValue(BooleanValue)
    case charValue(CharValue)
    case doubleValue(DoubleValue)
    case doublyLinkedListValue(DoublyLinkedListValue)
    case integerValue(IntegerValue)
    case listValue(ListValue)
    case mapValue(MapValue)
    case nullValue(NullValue)
    case singlyLinkedListValue(SinglyLinkedListValue)
    case stringValue(StringValue)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "binaryTreeValue":
            self = .binaryTreeValue(try BinaryTreeValue(from: decoder))
        case "booleanValue":
            self = .booleanValue(try BooleanValue(from: decoder))
        case "charValue":
            self = .charValue(try CharValue(from: decoder))
        case "doubleValue":
            self = .doubleValue(try DoubleValue(from: decoder))
        case "doublyLinkedListValue":
            self = .doublyLinkedListValue(try DoublyLinkedListValue(from: decoder))
        case "integerValue":
            self = .integerValue(try IntegerValue(from: decoder))
        case "listValue":
            self = .listValue(try ListValue(from: decoder))
        case "mapValue":
            self = .mapValue(try MapValue(from: decoder))
        case "nullValue":
            self = .nullValue(try NullValue(from: decoder))
        case "singlyLinkedListValue":
            self = .singlyLinkedListValue(try SinglyLinkedListValue(from: decoder))
        case "stringValue":
            self = .stringValue(try StringValue(from: decoder))
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
        case .binaryTreeValue(let data):
            try data.encode(to: encoder)
        case .booleanValue(let data):
            try data.encode(to: encoder)
        case .charValue(let data):
            try data.encode(to: encoder)
        case .doubleValue(let data):
            try data.encode(to: encoder)
        case .doublyLinkedListValue(let data):
            try data.encode(to: encoder)
        case .integerValue(let data):
            try data.encode(to: encoder)
        case .listValue(let data):
            try data.encode(to: encoder)
        case .mapValue(let data):
            try data.encode(to: encoder)
        case .nullValue(let data):
            try data.encode(to: encoder)
        case .singlyLinkedListValue(let data):
            try data.encode(to: encoder)
        case .stringValue(let data):
            try data.encode(to: encoder)
        }
    }

    public struct IntegerValue: Codable, Hashable, Sendable {
        public let type: String = "integerValue"
        public let value: Int
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: Int,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(Int.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct BooleanValue: Codable, Hashable, Sendable {
        public let type: String = "booleanValue"
        public let value: Bool
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: Bool,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(Bool.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct DoubleValue: Codable, Hashable, Sendable {
        public let type: String = "doubleValue"
        public let value: Double
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: Double,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(Double.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct StringValue: Codable, Hashable, Sendable {
        public let type: String = "stringValue"
        public let value: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(String.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct CharValue: Codable, Hashable, Sendable {
        public let type: String = "charValue"
        public let value: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(String.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct MapValue: Codable, Hashable, Sendable {
        public let type: String = "mapValue"
        public let keyValuePairs: [KeyValuePair]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            keyValuePairs: [KeyValuePair],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.keyValuePairs = keyValuePairs
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.keyValuePairs = try container.decode([KeyValuePair].self, forKey: .keyValuePairs)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.keyValuePairs, forKey: .keyValuePairs)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case keyValuePairs
        }
    }

    public struct ListValue: Codable, Hashable, Sendable {
        public let type: String = "listValue"
        public let value: [VariableValue]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: [VariableValue],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode([VariableValue].self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct BinaryTreeValue: Codable, Hashable, Sendable {
        public let type: String = "binaryTreeValue"
        public let root: NodeId?
        public let nodes: [NodeId: BinaryTreeNodeValue]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            root: NodeId? = nil,
            nodes: [NodeId: BinaryTreeNodeValue],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.root = root
            self.nodes = nodes
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.root = try container.decodeIfPresent(NodeId.self, forKey: .root)
            self.nodes = try container.decode([NodeId: BinaryTreeNodeValue].self, forKey: .nodes)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encodeIfPresent(self.root, forKey: .root)
            try container.encode(self.nodes, forKey: .nodes)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case root
            case nodes
        }
    }

    public struct SinglyLinkedListValue: Codable, Hashable, Sendable {
        public let type: String = "singlyLinkedListValue"
        public let head: NodeId?
        public let nodes: [NodeId: SinglyLinkedListNodeValue]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            head: NodeId? = nil,
            nodes: [NodeId: SinglyLinkedListNodeValue],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.head = head
            self.nodes = nodes
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.head = try container.decodeIfPresent(NodeId.self, forKey: .head)
            self.nodes = try container.decode([NodeId: SinglyLinkedListNodeValue].self, forKey: .nodes)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encodeIfPresent(self.head, forKey: .head)
            try container.encode(self.nodes, forKey: .nodes)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case head
            case nodes
        }
    }

    public struct DoublyLinkedListValue: Codable, Hashable, Sendable {
        public let type: String = "doublyLinkedListValue"
        public let head: NodeId?
        public let nodes: [NodeId: DoublyLinkedListNodeValue]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            head: NodeId? = nil,
            nodes: [NodeId: DoublyLinkedListNodeValue],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.head = head
            self.nodes = nodes
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.head = try container.decodeIfPresent(NodeId.self, forKey: .head)
            self.nodes = try container.decode([NodeId: DoublyLinkedListNodeValue].self, forKey: .nodes)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encodeIfPresent(self.head, forKey: .head)
            try container.encode(self.nodes, forKey: .nodes)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case head
            case nodes
        }
    }

    public struct NullValue: Codable, Hashable, Sendable {
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