import Foundation

public struct V2V3ProblemInfoV2: Codable, Hashable, Sendable {
    public let problemId: ProblemId
    public let problemDescription: ProblemDescription
    public let problemName: String
    public let problemVersion: Int
    public let supportedLanguages: [Language]
    public let customFiles: V2V3CustomFiles
    public let generatedFiles: V2V3GeneratedFiles
    public let customTestCaseTemplates: [V2V3TestCaseTemplate]
    public let testcases: [V2V3TestCaseV2]
    public let isPublic: Bool
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        problemId: ProblemId,
        problemDescription: ProblemDescription,
        problemName: String,
        problemVersion: Int,
        supportedLanguages: [Language],
        customFiles: V2V3CustomFiles,
        generatedFiles: V2V3GeneratedFiles,
        customTestCaseTemplates: [V2V3TestCaseTemplate],
        testcases: [V2V3TestCaseV2],
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
        self.supportedLanguages = try container.decode([Language].self, forKey: .supportedLanguages)
        self.customFiles = try container.decode(V2V3CustomFiles.self, forKey: .customFiles)
        self.generatedFiles = try container.decode(V2V3GeneratedFiles.self, forKey: .generatedFiles)
        self.customTestCaseTemplates = try container.decode([V2V3TestCaseTemplate].self, forKey: .customTestCaseTemplates)
        self.testcases = try container.decode([V2V3TestCaseV2].self, forKey: .testcases)
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

    /// Keys for encoding/decoding struct properties.
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