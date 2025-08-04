public struct TestCaseImplementationDescriptionType: Codable, Hashable, Sendable {
    public let boards: [TestCaseImplementationDescriptionBoardType]
    public let additionalProperties: [String: JSONValue]

    public init(
        boards: [TestCaseImplementationDescriptionBoardType],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.boards = boards
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.boards = try container.decode([TestCaseImplementationDescriptionBoardType].self, forKey: .boards)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.boards, forKey: .boards)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case boards
    }
}