import Foundation

/// Represents an identity provider connection
public struct Connection: Codable, Hashable, Sendable {
    /// Connection identifier
    public let id: String
    /// Connection name
    public let name: String
    /// Display name for the connection
    public let displayName: String?
    /// The identity provider identifier (auth0, google-oauth2, facebook, etc.)
    public let strategy: String
    /// Connection-specific configuration options
    public let options: [String: JSONValue]?
    /// List of client IDs that can use this connection
    public let enabledClients: [String]?
    /// Applicable realms for enterprise connections
    public let realms: [String]?
    /// Whether this is a domain connection
    public let isDomainConnection: Bool?
    /// Additional metadata
    public let metadata: [String: JSONValue]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        name: String,
        displayName: String? = nil,
        strategy: String,
        options: [String: JSONValue]? = nil,
        enabledClients: [String]? = nil,
        realms: [String]? = nil,
        isDomainConnection: Bool? = nil,
        metadata: [String: JSONValue]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.name = name
        self.displayName = displayName
        self.strategy = strategy
        self.options = options
        self.enabledClients = enabledClients
        self.realms = realms
        self.isDomainConnection = isDomainConnection
        self.metadata = metadata
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.displayName = try container.decodeIfPresent(String.self, forKey: .displayName)
        self.strategy = try container.decode(String.self, forKey: .strategy)
        self.options = try container.decodeIfPresent([String: JSONValue].self, forKey: .options)
        self.enabledClients = try container.decodeIfPresent([String].self, forKey: .enabledClients)
        self.realms = try container.decodeIfPresent([String].self, forKey: .realms)
        self.isDomainConnection = try container.decodeIfPresent(Bool.self, forKey: .isDomainConnection)
        self.metadata = try container.decodeIfPresent([String: JSONValue].self, forKey: .metadata)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encodeIfPresent(self.displayName, forKey: .displayName)
        try container.encode(self.strategy, forKey: .strategy)
        try container.encodeIfPresent(self.options, forKey: .options)
        try container.encodeIfPresent(self.enabledClients, forKey: .enabledClients)
        try container.encodeIfPresent(self.realms, forKey: .realms)
        try container.encodeIfPresent(self.isDomainConnection, forKey: .isDomainConnection)
        try container.encodeIfPresent(self.metadata, forKey: .metadata)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case name
        case displayName = "display_name"
        case strategy
        case options
        case enabledClients = "enabled_clients"
        case realms
        case isDomainConnection = "is_domain_connection"
        case metadata
    }
}