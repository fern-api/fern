public struct ProblemInfoV2Type: Codable, Hashable, Sendable {
    public let problemId: ProblemId
    public let problemDescription: ProblemDescription
    public let problemName: String
    public let problemVersion: Int
    public let supportedLanguages: JSONValue
    public let customFiles: CustomFilesType
    public let generatedFiles: GeneratedFilesType
    public let customTestCaseTemplates: [TestCaseTemplateType]
    public let testcases: [TestCaseV2Type]
    public let isPublic: Bool
    public let additionalProperties: [String: JSONValue]

    public init(
        problemId: ProblemId,
        problemDescription: ProblemDescription,
        problemName: String,
        problemVersion: Int,
        supportedLanguages: JSONValue,
        customFiles: CustomFilesType,
        generatedFiles: GeneratedFilesType,
        customTestCaseTemplates: [TestCaseTemplateType],
        testcases: [TestCaseV2Type],
        isPublic: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.problemId = problemId
        self.problemDescription = problemDescription
        self.problemName = problemName
        self.problemVersion = problemVersion
        self.supportedLanguages = supportedLanguages
        self.customFiles = customFiles
        self.generatedFiles = generatedFiles
        self.customTestCaseTemplates = customTestCaseTemplates
        self.testcases = testcases
        self.isPublic = isPublic
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
        self.problemDescription = try container.decode(ProblemDescription.self, forKey: .problemDescription)
        self.problemName = try container.decode(String.self, forKey: .problemName)
        self.problemVersion = try container.decode(Int.self, forKey: .problemVersion)
        self.supportedLanguages = try container.decode(JSONValue.self, forKey: .supportedLanguages)
        self.customFiles = try container.decode(CustomFilesType.self, forKey: .customFiles)
        self.generatedFiles = try container.decode(GeneratedFilesType.self, forKey: .generatedFiles)
        self.customTestCaseTemplates = try container.decode([TestCaseTemplateType].self, forKey: .customTestCaseTemplates)
        self.testcases = try container.decode([TestCaseV2Type].self, forKey: .testcases)
        self.isPublic = try container.decode(Bool.self, forKey: .isPublic)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemId, forKey: .problemId)
        try container.encode(self.problemDescription, forKey: .problemDescription)
        try container.encode(self.problemName, forKey: .problemName)
        try container.encode(self.problemVersion, forKey: .problemVersion)
        try container.encode(self.supportedLanguages, forKey: .supportedLanguages)
        try container.encode(self.customFiles, forKey: .customFiles)
        try container.encode(self.generatedFiles, forKey: .generatedFiles)
        try container.encode(self.customTestCaseTemplates, forKey: .customTestCaseTemplates)
        try container.encode(self.testcases, forKey: .testcases)
        try container.encode(self.isPublic, forKey: .isPublic)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemId
        case problemDescription
        case problemName
        case problemVersion
        case supportedLanguages
        case customFiles
        case generatedFiles
        case customTestCaseTemplates
        case testcases
        case isPublic
    }
}