public struct ProblemInfo: Codable, Hashable {
    public let problemId: ProblemId
    public let problemDescription: ProblemDescription
    public let problemName: String
    public let problemVersion: Int
    public let files: Any
    public let inputParams: [VariableTypeAndName]
    public let outputType: VariableType
    public let testcases: [TestCaseWithExpectedResult]
    public let methodName: String
    public let supportsCustomTestCases: Bool
    public let additionalProperties: [String: JSONValue]

    public init(problemId: ProblemId, problemDescription: ProblemDescription, problemName: String, problemVersion: Int, files: Any, inputParams: [VariableTypeAndName], outputType: VariableType, testcases: [TestCaseWithExpectedResult], methodName: String, supportsCustomTestCases: Bool, additionalProperties: [String: JSONValue] = .init()) {
        self.problemId = problemId
        self.problemDescription = problemDescription
        self.problemName = problemName
        self.problemVersion = problemVersion
        self.files = files
        self.inputParams = inputParams
        self.outputType = outputType
        self.testcases = testcases
        self.methodName = methodName
        self.supportsCustomTestCases = supportsCustomTestCases
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
        self.problemDescription = try container.decode(ProblemDescription.self, forKey: .problemDescription)
        self.problemName = try container.decode(String.self, forKey: .problemName)
        self.problemVersion = try container.decode(Int.self, forKey: .problemVersion)
        self.files = try container.decode(Any.self, forKey: .files)
        self.inputParams = try container.decode([VariableTypeAndName].self, forKey: .inputParams)
        self.outputType = try container.decode(VariableType.self, forKey: .outputType)
        self.testcases = try container.decode([TestCaseWithExpectedResult].self, forKey: .testcases)
        self.methodName = try container.decode(String.self, forKey: .methodName)
        self.supportsCustomTestCases = try container.decode(Bool.self, forKey: .supportsCustomTestCases)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemId, forKey: .problemId)
        try container.encode(self.problemDescription, forKey: .problemDescription)
        try container.encode(self.problemName, forKey: .problemName)
        try container.encode(self.problemVersion, forKey: .problemVersion)
        try container.encode(self.files, forKey: .files)
        try container.encode(self.inputParams, forKey: .inputParams)
        try container.encode(self.outputType, forKey: .outputType)
        try container.encode(self.testcases, forKey: .testcases)
        try container.encode(self.methodName, forKey: .methodName)
        try container.encode(self.supportsCustomTestCases, forKey: .supportsCustomTestCases)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemId
        case problemDescription
        case problemName
        case problemVersion
        case files
        case inputParams
        case outputType
        case testcases
        case methodName
        case supportsCustomTestCases
    }
}