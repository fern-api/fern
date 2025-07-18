public struct TestSubmissionUpdate: Codable, Hashable {
    public let updateTime: Date
    public let updateInfo: TestSubmissionUpdateInfo
    public let additionalProperties: [String: JSONValue]

    public init(updateTime: Date, updateInfo: TestSubmissionUpdateInfo, additionalProperties: [String: JSONValue] = .init()) {
        self.updateTime = updateTime
        self.updateInfo = updateInfo
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.updateTime = try container.decode(Date.self, forKey: .updateTime)
        self.updateInfo = try container.decode(TestSubmissionUpdateInfo.self, forKey: .updateInfo)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.updateTime, forKey: .updateTime)
        try container.encode(self.updateInfo, forKey: .updateInfo)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case updateTime
        case updateInfo
    }
}