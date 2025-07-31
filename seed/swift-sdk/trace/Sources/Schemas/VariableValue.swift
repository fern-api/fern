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

    public struct IntegerValue: Codable, Hashable, Sendable {
        public let value: Int

        public init(value: Int) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct BooleanValue: Codable, Hashable, Sendable {
        public let value: Bool

        public init(value: Bool) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct DoubleValue: Codable, Hashable, Sendable {
        public let value: Double

        public init(value: Double) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct StringValue: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct CharValue: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct MapValue: Codable, Hashable, Sendable {
        public let type: String = "mapValue"
        public let keyValuePairs: [KeyValuePair]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, keyValuePairs: [KeyValuePair], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ListValue: Codable, Hashable, Sendable {
        public let value: [VariableValue]

        public init(value: [VariableValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct BinaryTreeValue: Codable, Hashable, Sendable {
        public let type: String = "binaryTreeValue"
        public let root: NodeId?
        public let nodes: [NodeId: BinaryTreeNodeValue]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, root: NodeId?, nodes: [NodeId: BinaryTreeNodeValue], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct SinglyLinkedListValue: Codable, Hashable, Sendable {
        public let type: String = "singlyLinkedListValue"
        public let head: NodeId?
        public let nodes: [NodeId: SinglyLinkedListNodeValue]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, head: NodeId?, nodes: [NodeId: SinglyLinkedListNodeValue], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct DoublyLinkedListValue: Codable, Hashable, Sendable {
        public let type: String = "doublyLinkedListValue"
        public let head: NodeId?
        public let nodes: [NodeId: DoublyLinkedListNodeValue]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, head: NodeId?, nodes: [NodeId: DoublyLinkedListNodeValue], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct NullValue: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}