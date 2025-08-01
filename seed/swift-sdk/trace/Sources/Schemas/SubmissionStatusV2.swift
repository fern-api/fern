public enum SubmissionStatusV2: Codable, Hashable, Sendable {
    case test(Test)
    case workspace(Workspace)

    public struct Test: Codable, Hashable, Sendable {
        public let type: String = "test"
        public let updates: [TestSubmissionUpdate]
        public let problemId: ProblemId
        public let problemVersion: Int
        public let problemInfo: ProblemInfoV2
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            updates: [TestSubmissionUpdate],
            problemId: ProblemId,
            problemVersion: Int,
            problemInfo: ProblemInfoV2,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.updates = updates
            self.problemId = problemId
            self.problemVersion = problemVersion
            self.problemInfo = problemInfo
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.updates = try container.decode([TestSubmissionUpdate].self, forKey: .updates)
            self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
            self.problemVersion = try container.decode(Int.self, forKey: .problemVersion)
            self.problemInfo = try container.decode(ProblemInfoV2.self, forKey: .problemInfo)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.updates, forKey: .updates)
            try container.encode(self.problemId, forKey: .problemId)
            try container.encode(self.problemVersion, forKey: .problemVersion)
            try container.encode(self.problemInfo, forKey: .problemInfo)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case updates = "placeholder"
            case problemId = "placeholder"
            case problemVersion = "placeholder"
            case problemInfo = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Workspace: Codable, Hashable, Sendable {
        public let type: String = "workspace"
        public let updates: [WorkspaceSubmissionUpdate]
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            updates: [WorkspaceSubmissionUpdate],
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.updates = updates
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.updates = try container.decode([WorkspaceSubmissionUpdate].self, forKey: .updates)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.updates, forKey: .updates)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case updates = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}