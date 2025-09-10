import Foundation

public struct TraceResponseV2: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let lineNumber: Int
    public let file: TracedFile
    public let returnValue: DebugVariableValue?
    public let expressionLocation: ExpressionLocation?
    public let stack: StackInformation
    public let stdout: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        lineNumber: Int,
        file: TracedFile,
        returnValue: DebugVariableValue? = nil,
        expressionLocation: ExpressionLocation? = nil,
        stack: StackInformation,
        stdout: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.lineNumber = lineNumber
        self.file = file
        self.returnValue = returnValue
        self.expressionLocation = expressionLocation
        self.stack = stack
        self.stdout = stdout
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.lineNumber = try container.decode(Int.self, forKey: .lineNumber)
        self.file = try container.decode(TracedFile.self, forKey: .file)
        self.returnValue = try container.decodeIfPresent(DebugVariableValue.self, forKey: .returnValue)
        self.expressionLocation = try container.decodeIfPresent(ExpressionLocation.self, forKey: .expressionLocation)
        self.stack = try container.decode(StackInformation.self, forKey: .stack)
        self.stdout = try container.decodeIfPresent(String.self, forKey: .stdout)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.lineNumber, forKey: .lineNumber)
        try container.encode(self.file, forKey: .file)
        try container.encodeIfPresent(self.returnValue, forKey: .returnValue)
        try container.encodeIfPresent(self.expressionLocation, forKey: .expressionLocation)
        try container.encode(self.stack, forKey: .stack)
        try container.encodeIfPresent(self.stdout, forKey: .stdout)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case lineNumber
        case file
        case returnValue
        case expressionLocation
        case stack
        case stdout
    }
}