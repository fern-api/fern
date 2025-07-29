public struct CreateProblemRequestV2: Codable, Hashable, Sendable {
    public let problemName: String
    public let problemDescription: ProblemDescription
    public let customFiles: CustomFiles
    public let customTestCaseTemplates: [TestCaseTemplate]
    public let testcases: [TestCaseV2]
    public let supportedLanguages: Any
    public let isPublic: Bool
    public let additionalProperties: [String: JSONValue]

    public init(
        problemName: String,
        problemDescription: ProblemDescription,
        customFiles: CustomFiles,
        customTestCaseTemplates: [TestCaseTemplate],
        testcases: [TestCaseV2],
        supportedLanguages: Any,
        isPublic: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.problemName = problemName
        self.problemDescription = problemDescription
        self.customFiles = customFiles
        self.customTestCaseTemplates = customTestCaseTemplates
        self.testcases = testcases
        self.supportedLanguages = supportedLanguages
        self.isPublic = isPublic
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemName = try container.decode(String.self, forKey: .problemName)
        self.problemDescription = try container.decode(ProblemDescription.self, forKey: .problemDescription)
        self.customFiles = try container.decode(CustomFiles.self, forKey: .customFiles)
        self.customTestCaseTemplates = try container.decode([TestCaseTemplate].self, forKey: .customTestCaseTemplates)
        self.testcases = try container.decode([TestCaseV2].self, forKey: .testcases)
        self.supportedLanguages = try container.decode(Any.self, forKey: .supportedLanguages)
        self.isPublic = try container.decode(Bool.self, forKey: .isPublic)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemName, forKey: .problemName)
        try container.encode(self.problemDescription, forKey: .problemDescription)
        try container.encode(self.customFiles, forKey: .customFiles)
        try container.encode(self.customTestCaseTemplates, forKey: .customTestCaseTemplates)
        try container.encode(self.testcases, forKey: .testcases)
        try container.encode(self.supportedLanguages, forKey: .supportedLanguages)
        try container.encode(self.isPublic, forKey: .isPublic)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemName
        case problemDescription
        case customFiles
        case customTestCaseTemplates
        case testcases
        case supportedLanguages
        case isPublic
    }
}