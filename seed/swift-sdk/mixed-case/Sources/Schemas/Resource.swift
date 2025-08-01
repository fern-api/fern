public enum Resource: Codable, Hashable, Sendable {
    case user(User)
    case organization(Organization)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
    }

    public struct User: Codable, Hashable, Sendable {
        public let resourceType: String = "user"
        public let userName: String
        public let metadataTags: [String]
        public let extraProperties: [String: String]
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
            try container.encode(self.userName, forKey: .userName)
            try container.encode(self.metadataTags, forKey: .metadataTags)
            try container.encode(self.extraProperties, forKey: .extraProperties)
        }

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
            try container.encode(self.name, forKey: .name)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case resourceType = "resource_type"
            case name
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case resourceType = "resource_type"
    }
}