public enum SubmissionStatusV2: Codable, Hashable, Sendable {
    case test(Test)
    case workspace(Workspace)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "test":
            self = .test(try Test(from: decoder))
        case "workspace":
            self = .workspace(try Workspace(from: decoder))
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
        case .test(let data):
            try data.encode(to: encoder)
        case .workspace(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Test: Codable, Hashable, Sendable {
        public let type: String = "test"
        public let updates: [TestSubmissionUpdate]
        public let problemId: ProblemId
        public let problemVersion: Int
        public let problemInfo: ProblemInfoV2
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            updates: [TestSubmissionUpdate],
            problemId: ProblemId,
            problemVersion: Int,
            problemInfo: ProblemInfoV2,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.updates = updates
            self.problemId = problemId
            self.problemVersion = problemVersion
            self.problemInfo = problemInfo
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.updates = try container.decode([TestSubmissionUpdate].self, forKey: .updates)
            self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
            self.problemVersion = try container.decode(Int.self, forKey: .problemVersion)
            self.problemInfo = try container.decode(ProblemInfoV2.self, forKey: .problemInfo)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.updates, forKey: .updates)
            try container.encode(self.problemId, forKey: .problemId)
            try container.encode(self.problemVersion, forKey: .problemVersion)
            try container.encode(self.problemInfo, forKey: .problemInfo)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case updates
            case problemId
            case problemVersion
            case problemInfo
        }
    }

    public struct Workspace: Codable, Hashable, Sendable {
        public let type: String = "workspace"
        public let updates: [WorkspaceSubmissionUpdate]
        /// Additional properties that are not explicitly defined in the schema
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
            try container.encode(self.type, forKey: .type)
            try container.encode(self.updates, forKey: .updates)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case updates
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}