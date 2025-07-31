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

    public struct IntegerType: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct DoubleType: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct BooleanType: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct StringType: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct CharType: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ListType: Codable, Hashable, Sendable {
        public let type: String = "listType"
        public let valueType: VariableType
        public let isFixedLength: Bool?
        public let additionalProperties: [String: JSONValue]

        public init(type: String, valueType: VariableType, isFixedLength: Bool?, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct MapType: Codable, Hashable, Sendable {
        public let type: String = "mapType"
        public let keyType: VariableType
        public let valueType: VariableType
        public let additionalProperties: [String: JSONValue]

        public init(type: String, keyType: VariableType, valueType: VariableType, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct BinaryTreeType: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct SinglyLinkedListType: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct DoublyLinkedListType: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}