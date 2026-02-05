import Foundation

public enum UnionWithDuplicativeDiscriminants: Codable, Hashable, Sendable {
    case firstItemType(FirstItemType)
    case secondItemType(SecondItemType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "firstItemType":
            self = .firstItemType(try FirstItemType(from: decoder))
        case "secondItemType":
            self = .secondItemType(try SecondItemType(from: decoder))
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
        case .firstItemType(let data):
            try data.encode(to: encoder)
        case .secondItemType(let data):
            try data.encode(to: encoder)
        }
    }

    public struct FirstItemType: Codable, Hashable, Sendable {
        public let type: String = "firstItemType"
        public let name: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            name: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.name, forKey: .name)
        }

        public enum FirstItemType: String, Codable, Hashable, CaseIterable, Sendable {
            case firstItemType
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case name
        }
    }

    public struct SecondItemType: Codable, Hashable, Sendable {
        public let type: String = "secondItemType"
        public let title: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            title: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.title = title
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.title = try container.decode(String.self, forKey: .title)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.title, forKey: .title)
        }

        public enum SecondItemType: String, Codable, Hashable, CaseIterable, Sendable {
            case secondItemType
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case title
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}