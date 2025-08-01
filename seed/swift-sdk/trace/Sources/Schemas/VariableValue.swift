public enum VariableValue: Codable, Hashable, Sendable {
    case integerValue(IntegerValue)
    case booleanValue(BooleanValue)
    case doubleValue(DoubleValue)
    case stringValue(StringValue)
    case charValue(CharValue)
    case mapValue(MapValue)
    case listValue(ListValue)
    case binaryTreeValue(BinaryTreeValue)
    case singlyLinkedListValue(SinglyLinkedListValue)
    case doublyLinkedListValue(DoublyLinkedListValue)
    case nullValue(NullValue)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
    }

    public struct IntegerValue: Codable, Hashable, Sendable {
        public let type: String = "integerValue"
        public let value: Int
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
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct BooleanValue: Codable, Hashable, Sendable {
        public let type: String = "booleanValue"
        public let value: Bool
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
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct DoubleValue: Codable, Hashable, Sendable {
        public let type: String = "doubleValue"
        public let value: Double
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
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct StringValue: Codable, Hashable, Sendable {
        public let type: String = "stringValue"
        public let value: String
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
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct CharValue: Codable, Hashable, Sendable {
        public let type: String = "charValue"
        public let value: String
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
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct MapValue: Codable, Hashable, Sendable {
        public let type: String = "mapValue"
        public let keyValuePairs: [KeyValuePair]
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
            try container.encode(self.keyValuePairs, forKey: .keyValuePairs)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case keyValuePairs
        }
    }

    public struct ListValue: Codable, Hashable, Sendable {
        public let type: String = "listValue"
        public let value: [VariableValue]
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
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct BinaryTreeValue: Codable, Hashable, Sendable {
        public let type: String = "binaryTreeValue"
        public let root: NodeId?
        public let nodes: [NodeId: BinaryTreeNodeValue]
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
            try container.encodeIfPresent(self.root, forKey: .root)
            try container.encode(self.nodes, forKey: .nodes)
        }

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
            try container.encodeIfPresent(self.head, forKey: .head)
            try container.encode(self.nodes, forKey: .nodes)
        }

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
            try container.encodeIfPresent(self.head, forKey: .head)
            try container.encode(self.nodes, forKey: .nodes)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case head
            case nodes
        }
    }

    public struct NullValue: Codable, Hashable, Sendable {
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