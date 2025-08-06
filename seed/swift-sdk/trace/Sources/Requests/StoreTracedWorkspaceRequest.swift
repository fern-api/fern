public struct StoreTracedWorkspaceRequest: Codable, Hashable, Sendable {
    public let workspaceRunDetails: WorkspaceRunDetails
    public let traceResponses: [TraceResponse]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        workspaceRunDetails: WorkspaceRunDetails,
        traceResponses: [TraceResponse],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.workspaceRunDetails = workspaceRunDetails
        self.traceResponses = traceResponses
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.workspaceRunDetails = try container.decode(WorkspaceRunDetails.self, forKey: .workspaceRunDetails)
        self.traceResponses = try container.decode([TraceResponse].self, forKey: .traceResponses)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.workspaceRunDetails, forKey: .workspaceRunDetails)
        try container.encode(self.traceResponses, forKey: .traceResponses)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case workspaceRunDetails
        case traceResponses
    }
}