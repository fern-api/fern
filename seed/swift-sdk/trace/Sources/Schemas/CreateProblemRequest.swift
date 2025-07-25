public struct CreateProblemRequest: Codable, Hashable {
    public let problemName: String
    public let problemDescription: ProblemDescription
    public let files: Any
    public let inputParams: [VariableTypeAndName]
    public let outputType: VariableType
    public let testcases: [TestCaseWithExpectedResult]
    public let methodName: String
    public let additionalProperties: [String: JSONValue]

    public init(problemName: String, problemDescription: ProblemDescription, files: Any, inputParams: [VariableTypeAndName], outputType: VariableType, testcases: [TestCaseWithExpectedResult], methodName: String, additionalProperties: [String: JSONValue] = .init()) {
        self.problemName = problemName
        self.problemDescription = problemDescription
        self.files = files
        self.inputParams = inputParams
        self.outputType = outputType
        self.testcases = testcases
        self.methodName = methodName
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemName = try container.decode(String.self, forKey: .problemName)
        self.problemDescription = try container.decode(ProblemDescription.self, forKey: .problemDescription)
        self.files = try container.decode(Any.self, forKey: .files)
        self.inputParams = try container.decode([VariableTypeAndName].self, forKey: .inputParams)
        self.outputType = try container.decode(VariableType.self, forKey: .outputType)
        self.testcases = try container.decode([TestCaseWithExpectedResult].self, forKey: .testcases)
        self.methodName = try container.decode(String.self, forKey: .methodName)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemName, forKey: .problemName)
        try container.encode(self.problemDescription, forKey: .problemDescription)
        try container.encode(self.files, forKey: .files)
        try container.encode(self.inputParams, forKey: .inputParams)
        try container.encode(self.outputType, forKey: .outputType)
        try container.encode(self.testcases, forKey: .testcases)
        try container.encode(self.methodName, forKey: .methodName)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemName
        case problemDescription
        case files
        case inputParams
        case outputType
        case testcases
        case methodName
    }
}