public struct WorkspaceSubmissionStatusV2: Codable, Hashable, Sendable {
    public let updates: [WorkspaceSubmissionUpdate]
    public let additionalProperties: [String: JSONValue]

    public init(
        updates: [WorkspaceSubmissionUpdate],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.updates = updates
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.updates = try container.decode([WorkspaceSubmissionUpdate].self, forKey: .updates)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.updates, forKey: .updates)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case updates
    }
}