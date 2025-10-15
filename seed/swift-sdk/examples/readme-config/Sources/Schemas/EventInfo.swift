import Foundation

public enum EventInfo: Codable, Hashable, Sendable {
    case metadata(Metadata)
    case tag(Tag)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "metadata":
            self = .metadata(try Metadata(from: decoder))
        case "tag":
            self = .tag(try Tag(from: decoder))
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
        case .metadata(let data):
            try data.encode(to: encoder)
        case .tag(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Metadata: Codable, Hashable, Sendable {
        public let type: String = "metadata"
        public let id: String
        public let data: [String: String]?
        public let jsonString: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            id: String,
            data: [String: String]? = nil,
            jsonString: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.id = id
            self.data = data
            self.jsonString = jsonString
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.id = try container.decode(String.self, forKey: .id)
            self.data = try container.decodeIfPresent([String: String].self, forKey: .data)
            self.jsonString = try container.decodeIfPresent(String.self, forKey: .jsonString)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.id, forKey: .id)
            try container.encodeIfPresent(self.data, forKey: .data)
            try container.encodeIfPresent(self.jsonString, forKey: .jsonString)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case id
            case data
            case jsonString
        }
    }

    public struct Tag: Codable, Hashable, Sendable {
        public let type: String = "tag"
        public let value: Examples.Tag
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: Examples.Tag,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(Examples.Tag.self, forKey: .value)
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

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}