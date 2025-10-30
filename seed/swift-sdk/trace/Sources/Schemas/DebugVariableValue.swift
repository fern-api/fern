import Foundation

public enum DebugVariableValue: Codable, Hashable, Sendable {
    case binaryTreeNodeValue(BinaryTreeNodeValue)
    case booleanValue(BooleanValue)
    case charValue(CharValue)
    case doubleValue(DoubleValue)
    case doublyLinkedListNodeValue(DoublyLinkedListNodeValue)
    case genericValue(GenericValue)
    case integerValue(IntegerValue)
    case listValue(ListValue)
    case mapValue(MapValue)
    case nullValue(NullValue)
    case singlyLinkedListNodeValue(SinglyLinkedListNodeValue)
    case stringValue(StringValue)
    case undefinedValue(UndefinedValue)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "binaryTreeNodeValue":
            self = .binaryTreeNodeValue(try BinaryTreeNodeValue(from: decoder))
        case "booleanValue":
            self = .booleanValue(try BooleanValue(from: decoder))
        case "charValue":
            self = .charValue(try CharValue(from: decoder))
        case "doubleValue":
            self = .doubleValue(try DoubleValue(from: decoder))
        case "doublyLinkedListNodeValue":
            self = .doublyLinkedListNodeValue(try DoublyLinkedListNodeValue(from: decoder))
        case "genericValue":
            self = .genericValue(try GenericValue(from: decoder))
        case "integerValue":
            self = .integerValue(try IntegerValue(from: decoder))
        case "listValue":
            self = .listValue(try ListValue(from: decoder))
        case "mapValue":
            self = .mapValue(try MapValue(from: decoder))
        case "nullValue":
            self = .nullValue(try NullValue(from: decoder))
        case "singlyLinkedListNodeValue":
            self = .singlyLinkedListNodeValue(try SinglyLinkedListNodeValue(from: decoder))
        case "stringValue":
            self = .stringValue(try StringValue(from: decoder))
        case "undefinedValue":
            self = .undefinedValue(try UndefinedValue(from: decoder))
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
        case .binaryTreeNodeValue(let data):
            try data.encode(to: encoder)
        case .booleanValue(let data):
            try data.encode(to: encoder)
        case .charValue(let data):
            try data.encode(to: encoder)
        case .doubleValue(let data):
            try data.encode(to: encoder)
        case .doublyLinkedListNodeValue(let data):
            try data.encode(to: encoder)
        case .genericValue(let data):
            try data.encode(to: encoder)
        case .integerValue(let data):
            try data.encode(to: encoder)
        case .listValue(let data):
            try data.encode(to: encoder)
        case .mapValue(let data):
            try data.encode(to: encoder)
        case .nullValue(let data):
            try data.encode(to: encoder)
        case .singlyLinkedListNodeValue(let data):
            try data.encode(to: encoder)
        case .stringValue(let data):
            try data.encode(to: encoder)
        case .undefinedValue(let data):
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
        public let keyValuePairs: [DebugKeyValuePairs]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            keyValuePairs: [DebugKeyValuePairs],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.keyValuePairs = keyValuePairs
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.keyValuePairs = try container.decode([DebugKeyValuePairs].self, forKey: .keyValuePairs)
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
        public let value: [DebugVariableValue]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: [DebugVariableValue],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode([DebugVariableValue].self, forKey: .value)
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

    public struct BinaryTreeNodeValue: Codable, Hashable, Sendable {
        public let type: String = "binaryTreeNodeValue"
        public let nodeId: NodeId
        public let fullTree: BinaryTreeValue
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            nodeId: NodeId,
            fullTree: BinaryTreeValue,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.nodeId = nodeId
            self.fullTree = fullTree
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.nodeId = try container.decode(NodeId.self, forKey: .nodeId)
            self.fullTree = try container.decode(BinaryTreeValue.self, forKey: .fullTree)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.nodeId, forKey: .nodeId)
            try container.encode(self.fullTree, forKey: .fullTree)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case nodeId
            case fullTree
        }
    }

    public struct SinglyLinkedListNodeValue: Codable, Hashable, Sendable {
        public let type: String = "singlyLinkedListNodeValue"
        public let nodeId: NodeId
        public let fullList: SinglyLinkedListValue
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            nodeId: NodeId,
            fullList: SinglyLinkedListValue,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.nodeId = nodeId
            self.fullList = fullList
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.nodeId = try container.decode(NodeId.self, forKey: .nodeId)
            self.fullList = try container.decode(SinglyLinkedListValue.self, forKey: .fullList)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.nodeId, forKey: .nodeId)
            try container.encode(self.fullList, forKey: .fullList)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case nodeId
            case fullList
        }
    }

    public struct DoublyLinkedListNodeValue: Codable, Hashable, Sendable {
        public let type: String = "doublyLinkedListNodeValue"
        public let nodeId: NodeId
        public let fullList: DoublyLinkedListValue
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            nodeId: NodeId,
            fullList: DoublyLinkedListValue,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.nodeId = nodeId
            self.fullList = fullList
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.nodeId = try container.decode(NodeId.self, forKey: .nodeId)
            self.fullList = try container.decode(DoublyLinkedListValue.self, forKey: .fullList)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.nodeId, forKey: .nodeId)
            try container.encode(self.fullList, forKey: .fullList)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case nodeId
            case fullList
        }
    }

    public struct UndefinedValue: Codable, Hashable, Sendable {
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

    public struct GenericValue: Codable, Hashable, Sendable {
        public let type: String = "genericValue"
        public let stringifiedType: String?
        public let stringifiedValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            stringifiedType: String? = nil,
            stringifiedValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.stringifiedType = stringifiedType
            self.stringifiedValue = stringifiedValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.stringifiedType = try container.decodeIfPresent(String.self, forKey: .stringifiedType)
            self.stringifiedValue = try container.decode(String.self, forKey: .stringifiedValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encodeIfPresent(self.stringifiedType, forKey: .stringifiedType)
            try container.encode(self.stringifiedValue, forKey: .stringifiedValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case stringifiedType
            case stringifiedValue
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}