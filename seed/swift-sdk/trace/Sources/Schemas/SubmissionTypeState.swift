public enum SubmissionTypeState: Codable, Hashable, Sendable {
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
        public let problemId: ProblemId
        public let defaultTestCases: [TestCase]
        public let customTestCases: [TestCase]
        public let status: TestSubmissionStatus
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            problemId: ProblemId,
            defaultTestCases: [TestCase],
            customTestCases: [TestCase],
            status: TestSubmissionStatus,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.problemId = problemId
            self.defaultTestCases = defaultTestCases
            self.customTestCases = customTestCases
            self.status = status
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
            self.defaultTestCases = try container.decode([TestCase].self, forKey: .defaultTestCases)
            self.customTestCases = try container.decode([TestCase].self, forKey: .customTestCases)
            self.status = try container.decode(TestSubmissionStatus.self, forKey: .status)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.problemId, forKey: .problemId)
            try container.encode(self.defaultTestCases, forKey: .defaultTestCases)
            try container.encode(self.customTestCases, forKey: .customTestCases)
            try container.encode(self.status, forKey: .status)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case problemId
            case defaultTestCases
            case customTestCases
            case status
        }
    }

    public struct Workspace: Codable, Hashable, Sendable {
        public let type: String = "workspace"
        public let status: WorkspaceSubmissionStatus
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            status: WorkspaceSubmissionStatus,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.status = status
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.status = try container.decode(WorkspaceSubmissionStatus.self, forKey: .status)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.status, forKey: .status)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case status
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}