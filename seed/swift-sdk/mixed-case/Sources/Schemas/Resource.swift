import Foundation

public enum Resource: Codable, Hashable, Sendable {
    case organization(Organization)
    case user(User)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .resourceType)
        switch discriminant {
        case "user":
            self = .user(try User(from: decoder))
        case "Organization":
            self = .organization(try Organization(from: decoder))
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
        case .user(let data):
            try data.encode(to: encoder)
        case .organization(let data):
            try data.encode(to: encoder)
        }
    }

    public struct User: Codable, Hashable, Sendable {
        public let resourceType: String = "user"
        public let userName: String
        public let metadataTags: [String]
        public let extraProperties: [String: String]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            userName: String,
            metadataTags: [String],
            extraProperties: [String: String],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.userName = userName
            self.metadataTags = metadataTags
            self.extraProperties = extraProperties
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.userName = try container.decode(String.self, forKey: .userName)
            self.metadataTags = try container.decode([String].self, forKey: .metadataTags)
            self.extraProperties = try container.decode([String: String].self, forKey: .extraProperties)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.resourceType, forKey: .resourceType)
            try container.encode(self.userName, forKey: .userName)
            try container.encode(self.metadataTags, forKey: .metadataTags)
            try container.encode(self.extraProperties, forKey: .extraProperties)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case resourceType = "resource_type"
            case userName
            case metadataTags = "metadata_tags"
            case extraProperties = "EXTRA_PROPERTIES"
        }
    }

    public struct Organization: Codable, Hashable, Sendable {
        public let resourceType: String = "Organization"
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
            try container.encode(self.resourceType, forKey: .resourceType)
            try container.encode(self.name, forKey: .name)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case resourceType = "resource_type"
            case name
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case resourceType = "resource_type"
    }
}