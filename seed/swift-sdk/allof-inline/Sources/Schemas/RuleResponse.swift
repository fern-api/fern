import Foundation

public struct RuleResponse: Codable, Hashable, Sendable {
    /// The user who created this resource.
    public let createdBy: String?
    /// When this resource was created.
    public let createdDateTime: Date?
    /// The user who last modified this resource.
    public let modifiedBy: String?
    /// When this resource was last modified.
    public let modifiedDateTime: Date?
    public let id: String
    public let name: String
    public let status: RuleResponseStatus
    public let executionContext: RuleExecutionContext?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        createdBy: String? = nil,
        createdDateTime: Date? = nil,
        modifiedBy: String? = nil,
        modifiedDateTime: Date? = nil,
        id: String,
        name: String,
        status: RuleResponseStatus,
        executionContext: RuleExecutionContext? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.createdBy = createdBy
        self.createdDateTime = createdDateTime
        self.modifiedBy = modifiedBy
        self.modifiedDateTime = modifiedDateTime
        self.id = id
        self.name = name
        self.status = status
        self.executionContext = executionContext
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.createdBy = try container.decodeIfPresent(String.self, forKey: .createdBy)
        self.createdDateTime = try container.decodeIfPresent(Date.self, forKey: .createdDateTime)
        self.modifiedBy = try container.decodeIfPresent(String.self, forKey: .modifiedBy)
        self.modifiedDateTime = try container.decodeIfPresent(Date.self, forKey: .modifiedDateTime)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.status = try container.decode(RuleResponseStatus.self, forKey: .status)
        self.executionContext = try container.decodeIfPresent(RuleExecutionContext.self, forKey: .executionContext)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.createdBy, forKey: .createdBy)
        try container.encodeIfPresent(self.createdDateTime, forKey: .createdDateTime)
        try container.encodeIfPresent(self.modifiedBy, forKey: .modifiedBy)
        try container.encodeIfPresent(self.modifiedDateTime, forKey: .modifiedDateTime)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.status, forKey: .status)
        try container.encodeIfPresent(self.executionContext, forKey: .executionContext)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case createdBy
        case createdDateTime
        case modifiedBy
        case modifiedDateTime
        case id
        case name
        case status
        case executionContext
    }
}