public enum DebugVariableValue: Codable, Hashable, Sendable {
    case integerValue(IntegerValue)
    case booleanValue(BooleanValue)
    case doubleValue(DoubleValue)
    case stringValue(StringValue)
    case charValue(CharValue)
    case mapValue(MapValue)
    case listValue(ListValue)
    case binaryTreeNodeValue(BinaryTreeNodeValue)
    case singlyLinkedListNodeValue(SinglyLinkedListNodeValue)
    case doublyLinkedListNodeValue(DoublyLinkedListNodeValue)
    case undefinedValue(UndefinedValue)
    case nullValue(NullValue)
    case genericValue(GenericValue)

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
        public let keyValuePairs: [DebugKeyValuePairs]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, keyValuePairs: [DebugKeyValuePairs], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ListValue: Codable, Hashable, Sendable {
        public let value: [DebugVariableValue]

        public init(value: [DebugVariableValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct BinaryTreeNodeValue: Codable, Hashable, Sendable {
        public let type: String = "binaryTreeNodeValue"
        public let nodeId: NodeId
        public let fullTree: BinaryTreeValue
        public let additionalProperties: [String: JSONValue]

        public init(type: String, nodeId: NodeId, fullTree: BinaryTreeValue, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct SinglyLinkedListNodeValue: Codable, Hashable, Sendable {
        public let type: String = "singlyLinkedListNodeValue"
        public let nodeId: NodeId
        public let fullList: SinglyLinkedListValue
        public let additionalProperties: [String: JSONValue]

        public init(type: String, nodeId: NodeId, fullList: SinglyLinkedListValue, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct DoublyLinkedListNodeValue: Codable, Hashable, Sendable {
        public let type: String = "doublyLinkedListNodeValue"
        public let nodeId: NodeId
        public let fullList: DoublyLinkedListValue
        public let additionalProperties: [String: JSONValue]

        public init(type: String, nodeId: NodeId, fullList: DoublyLinkedListValue, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct UndefinedValue: Codable, Hashable, Sendable {

        public init() {
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

    public struct GenericValue: Codable, Hashable, Sendable {
        public let type: String = "genericValue"
        public let stringifiedType: String?
        public let stringifiedValue: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, stringifiedType: String?, stringifiedValue: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}